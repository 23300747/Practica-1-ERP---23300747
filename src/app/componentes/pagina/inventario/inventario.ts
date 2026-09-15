import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductoService } from '../../../servicios/producto.service';
import { validarTexto, validarNumero } from '../../../servicios/http-cliente';

export interface ProductoInventario {
  id: number;
  producto: string;
  categoria: string;
  cantidad: string;
  precioUnitario: string;
  estado: string;
  claseEstado: string;
}

@Component({
  imports: [],
  selector: 'app-inventario',
  styleUrl: './inventario.css',
  templateUrl: './inventario.html',
})
export class Inventario implements OnInit {
  // Productos en inventario y estado del modal
  productos: ProductoInventario[] = [];
  mostrarModal = false;
  cargando = false;
  errorMensaje = '';

  formNombre = '';
  formCategoria = '';
  formPrecio: string = '';
  formCantidad: string = '';

  constructor(
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef
  ) {}

  // Encargado de cargar la lista de productos al iniciar
  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos((error, datos) => {
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

  // Encargado de abrir y cerrar la ventana emergente
  abrirModal(): void {
    this.formNombre = '';
    this.formCategoria = '';
    this.formPrecio = '';
    this.formCantidad = '';
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

  // Encargado de validar y guardar un nuevo producto
  guardarProducto(): void {
    if (this.cargando) return;

    const errNombre = validarTexto(this.formNombre, 50);
    if (errNombre) {
      this.errorMensaje = `Nombre: ${errNombre}`;
      return;
    }

    const errCat = validarTexto(this.formCategoria, 50);
    if (errCat) {
      this.errorMensaje = `Categoría: ${errCat}`;
      return;
    }

    const errPrecio = validarNumero(this.formPrecio);
    if (errPrecio) {
      this.errorMensaje = `Precio: ${errPrecio}`;
      return;
    }

    const errCantidad = validarNumero(this.formCantidad, true);
    if (errCantidad) {
      this.errorMensaje = `Cantidad: ${errCantidad}`;
      return;
    }

    this.errorMensaje = '';
    this.cargando = true;

    this.productoService.agregarProducto({
      nombre: this.formNombre.trim(),
      categoria: this.formCategoria.trim(),
      precio: Number(this.formPrecio),
      cantidad: Number(this.formCantidad)
    }, (error) => {
      this.cargando = false;
      if (error) {
        console.error('Error al agregar producto:', error);
        this.errorMensaje = error.mensaje || 'Error al agregar producto';
        this.cdr.detectChanges();
        return;
      }
      this.mostrarModal = false;
      this.cargarProductos();
    });
  }
}
