import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { VentaService } from '../../../servicios/venta.service';
import { ProductoService } from '../../../servicios/producto.service';
import { validarTexto, validarNumero } from '../../../servicios/http-cliente';

export interface ResumenVentas {
  ventasHoy: number;
  totalDia: string;
  ivaAcumulado: string;
}

export interface Venta {
  folio: string;
  cliente: string;
  canal: string;
  total: string;
  iva: string;
  estadoFactura: string;
  claseEstado: string;
}

@Component({
  imports: [],
  selector: 'app-ventas',
  styleUrl: './ventas.css',
  templateUrl: './ventas.html',
})
export class Ventas implements OnInit {
  // Resumen diario y listado de ventas realizadas
  resumen: ResumenVentas = {
    ventasHoy: 0,
    totalDia: '$0.00',
    ivaAcumulado: '$0.00'
  };

  ventas: Venta[] = [];
  productosLista: any[] = [];
  mostrarModal = false;
  cargando = false;
  errorMensaje = '';

  formNombreCliente = 'Público general';
  formProductoId: string = '';
  formCantidad: string = '';
  formPrecioUnitario: string = '';

  constructor(
    private ventaService: VentaService,
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef
  ) {}

  // Encargado de consultar ventas y productos al iniciar
  ngOnInit(): void {
    this.cargarDatos();
  }

  esAdmin(): boolean {
    return localStorage.getItem('rol') === 'administrador';
  }

  cargarDatos(): void {
    this.ventaService.obtenerResumen((error, datos) => {
      if (!error && datos) {
        this.resumen = datos;
        this.cdr.detectChanges();
      }
    });

    const propioId = this.esAdmin() ? undefined : Number(localStorage.getItem('usuarioId')) || undefined;
    this.ventaService.obtenerVentas((error, datos) => {
      if (!error && datos) {
        this.ventas = datos;
        this.cdr.detectChanges();
      }
    }, propioId);

    this.productoService.obtenerProductos((error, datos) => {
      if (!error && datos) {
        this.productosLista = datos;
        this.cdr.detectChanges();
      }
    });
  }

  // Encargado de abrir y cerrar la ventana de venta
  abrirModal(): void {
    this.formNombreCliente = 'Público general';
    this.formProductoId = '';
    this.formCantidad = '';
    this.formPrecioUnitario = '';
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

  // Encargado de consultar y mostrar la factura XML de una venta
  mostrarModalFactura = false;
  facturaSeleccionada: any = null;

  verFactura(item: Venta): void {
    this.ventaService.obtenerFactura(Number(item.folio), (error, datos) => {
      if (error || !datos) {
        alert('No se encontró la factura XML para este folio');
        return;
      }
      this.facturaSeleccionada = datos;
      this.mostrarModalFactura = true;
      this.cdr.detectChanges();
    });
  }

  cerrarModalFactura(): void {
    this.mostrarModalFactura = false;
    this.facturaSeleccionada = null;
    this.cdr.detectChanges();
  }

  guardarVenta(): void {
    if (this.cargando) return;

    const errCliente = validarTexto(this.formNombreCliente, 50);
    if (errCliente) {
      this.errorMensaje = `Cliente: ${errCliente}`;
      return;
    }

    if (!this.formProductoId) {
      this.errorMensaje = 'Debe seleccionar un producto';
      return;
    }

    const errCant = validarNumero(this.formCantidad, true);
    if (errCant) {
      this.errorMensaje = `Cantidad: ${errCant}`;
      return;
    }

    const errPrecio = validarNumero(this.formPrecioUnitario);
    if (errPrecio) {
      this.errorMensaje = `Precio unitario: ${errPrecio}`;
      return;
    }

    this.errorMensaje = '';
    this.cargando = true;

    this.ventaService.crearVenta({
      nombre_cliente: this.formNombreCliente.trim(),
      detalle: [{
        producto_id: Number(this.formProductoId),
        cantidad: Number(this.formCantidad),
        precio_unitario: Number(this.formPrecioUnitario)
      }]
    }, (error) => {
      this.cargando = false;
      if (error) {
        console.error('Error al crear venta:', error);
        this.errorMensaje = error.mensaje || 'Error al registrar venta';
        this.cdr.detectChanges();
        return;
      }
      this.mostrarModal = false;
      this.cargarDatos();
    });
  }
}