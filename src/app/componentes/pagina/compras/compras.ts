import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CompraService } from '../../../servicios/compra.service';
import { VentaService } from '../../../servicios/venta.service';
import { validarNumero } from '../../../servicios/http-cliente';

export interface ProductoCompra {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  estado: 'Disponible' | 'Poco stock' | 'Agotado';
  claseEtiqueta: 'verde' | 'naranja' | 'roja';
}

@Component({
  imports: [],
  selector: 'app-compras',
  styleUrl: './compras.css',
  templateUrl: './compras.html',
})
export class Compras implements OnInit {
  // Lista de productos del catálogo y estado del formulario
  productos: ProductoCompra[] = [];
  mostrarModal = false;
  modoClienteCompra = false;
  cargando = false;
  errorMensaje = '';

  productoSeleccionado: ProductoCompra | null = null;
  formProductoId: string = '';
  formCantidad: string = '1';
  formPrecioCompra: string = '';
  formDistribuidorId: string = '';
  formNombreCliente = 'Cliente';

  constructor(
    private compraService: CompraService,
    private ventaService: VentaService,
    private cdr: ChangeDetectorRef
  ) {}

  // Encargado de obtener los productos del catálogo al iniciar
  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.compraService.obtenerProductos((error, datos) => {
      if (error) {
        console.error('Error al obtener productos:', error);
        return;
      }
      this.productos = datos || [];
      this.cdr.detectChanges();
    });
  }

  esAdmin(): boolean {
    return localStorage.getItem('rol') === 'administrador';
  }

  // Encargado de abrir el modal para surtido de distribuidor (Admin)
  abrirModalAdmin(): void {
    this.modoClienteCompra = false;
    this.formProductoId = '';
    this.formCantidad = '';
    this.formPrecioCompra = '';
    this.formDistribuidorId = '';
    this.errorMensaje = '';
    this.cargando = false;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  // Encargado de abrir el modal para compra del cliente
  abrirModalCliente(producto: ProductoCompra): void {
    this.modoClienteCompra = true;
    this.productoSeleccionado = producto;
    this.formProductoId = String(producto.id);
    this.formCantidad = '1';
    this.formPrecioCompra = String(producto.precio);
    this.formNombreCliente = 'Cliente';
    this.errorMensaje = '';
    this.cargando = false;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    if (this.cargando) return;
    this.mostrarModal = false;
    this.cdr.detectChanges();
  }

  guardar(): void {
    if (this.cargando) return;

    if (!this.formProductoId) {
      this.errorMensaje = 'Debe seleccionar un producto';
      return;
    }

    const errCant = validarNumero(this.formCantidad, true);
    if (errCant) {
      this.errorMensaje = `Cantidad: ${errCant}`;
      return;
    }

    if (Number(this.formCantidad) <= 0) {
      this.errorMensaje = 'La cantidad debe ser mayor a 0';
      return;
    }

    this.errorMensaje = '';
    this.cargando = true;

    if (this.modoClienteCompra) {
      const prod = this.productos.find(p => p.id === Number(this.formProductoId));
      const precioUnitario = prod ? prod.precio : Number(this.formPrecioCompra || 0);

      this.ventaService.crearVenta({
        cliente_id: Number(localStorage.getItem('usuarioId')) || null,
        nombre_cliente: this.formNombreCliente || 'Cliente',
        detalle: [{
          producto_id: Number(this.formProductoId),
          cantidad: Number(this.formCantidad),
          precio_unitario: precioUnitario
        }]
      }, (error) => {
        this.cargando = false;
        if (error) {
          console.error('Error al realizar compra:', error);
          this.errorMensaje = error.mensaje || 'Error al procesar la compra';
          this.cdr.detectChanges();
          return;
        }
        this.mostrarModal = false;
        this.cargarProductos();
      });

    } else {
      const errPrecio = validarNumero(this.formPrecioCompra);
      if (errPrecio) {
        this.cargando = false;
        this.errorMensaje = `Precio de compra: ${errPrecio}`;
        return;
      }

      this.compraService.crearCompra({
        distribuidor_id: Number(this.formDistribuidorId || 0) || null,
        administrador_id: 1,
        detalle: [{
          producto_id: Number(this.formProductoId),
          cantidad: Number(this.formCantidad),
          precio_compra: Number(this.formPrecioCompra)
        }]
      }, (error) => {
        this.cargando = false;
        if (error) {
          console.error('Error al crear compra:', error);
          this.errorMensaje = error.mensaje || 'Error al registrar compra';
          this.cdr.detectChanges();
          return;
        }
        this.mostrarModal = false;
        this.cargarProductos();
      });
    }
  }
}