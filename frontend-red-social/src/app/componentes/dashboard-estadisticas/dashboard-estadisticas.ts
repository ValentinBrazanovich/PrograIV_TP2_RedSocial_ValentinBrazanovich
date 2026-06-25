import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { EstadisticasService } from '../../servicios/estadisticas';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule, RouterModule],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.css'
})
export class DashboardEstadisticas implements OnInit {
  
  // carga los datos del último mes
  fechaInicio: string = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
  fechaFin: string = new Date().toISOString().split('T')[0];

  // variables para guardar los datos de los gráficos
  datosBarras: ChartConfiguration<'bar'>['data'] | undefined;
  datosLineas: ChartConfiguration<'line'>['data'] | undefined;
  datosTorta: ChartConfiguration<'doughnut'>['data'] | undefined;
  titulosOriginalesBarras: string[] = [];
  titulosOriginalesDona: string[] = [];

  // gráfico de barras
  opcionesBarras: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { ticks: { color: '#a14cff' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { 
        ticks: { 
          color: '#00ffcc',
          callback: function(value) {
            const label = this.getLabelForValue(value as number);
            return label.length > 12 ? label.substring(0, 10) + '...' : label;
          }
        }, 
        grid: { color: 'rgba(255,255,255,0.05)' }
      }
    }
  };

  // gráfico de Líneas
  opcionesLineas: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#e0e0e0', font: { family: 'Segoe UI' } } }
    },
    scales: {
      y: { ticks: { color: '#a14cff' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#00ffcc' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  // gráfico de dona
  opcionesDona: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#e0e0e0', font: { family: 'Segoe UI' } } },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const tituloOriginal = this.titulosOriginalesDona[index] || '';

            return tituloOriginal.length > 50 
              ? tituloOriginal.substring(0, 50) + '...' 
              : tituloOriginal;
          }
        }
      }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };

  constructor(private estadisticasSvc: EstadisticasService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // trae del backend entre las fechas seleccionadas
    this.estadisticasSvc.obtenerReportes(this.fechaInicio, this.fechaFin).subscribe({
      next: (res: any) => {
        
        // gráfico de Barras
        this.titulosOriginalesBarras = res.pubsPorUsuario.map((item: any) => item.etiqueta);
        this.datosBarras = {
          labels: res.pubsPorUsuario.map((item: any) => item.etiqueta),
          datasets: [{
            data: res.pubsPorUsuario.map((item: any) => item.total),
            label: 'Publicaciones',
            backgroundColor: '#8a2be2',
            borderRadius: 6
          }]
        };

        // gráfico de Líneas
        this.datosLineas = {
          labels: res.comentariosPorFecha.map((item: any) => item.etiqueta),
          datasets: [{
            data: res.comentariosPorFecha.map((item: any) => item.total),
            label: 'Comentarios diarios',
            borderColor: '#00ffcc',
            backgroundColor: 'rgba(0, 255, 204, 0.2)',
            fill: true,
            tension: 0.4 // hace que la línea sea curva
          }]
        };

        // gráfico de dona
        this.titulosOriginalesDona = res.comentariosPorPub.map((item: any) => item.etiqueta);
        this.datosTorta = {
          labels: res.comentariosPorPub.map((item: any) => {
            return item.etiqueta.length > 20 
              ? item.etiqueta.substring(0, 10) + '...' 
              : item.etiqueta;
          }),
          datasets: [{
            data: res.comentariosPorPub.map((item: any) => item.total),
            backgroundColor: ['#8a2be2', '#00ffcc', '#ff007f', '#d1a3ff', '#1e90ff'],
            borderWidth: 0
          }]
        };

      }
    });
  }
}