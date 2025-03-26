import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { MotionService } from './Services/motion.service';
import { MotionData } from './Model/MotionData.model';
import Chart from 'chart.js/auto';
import { ChartConfiguration, LinearScale, BarElement, Title, Tooltip, Legend, CategoryScale } from 'chart.js';

// Registra los controladores, escalas, y elementos necesarios
Chart.register(
  LinearScale, // Escala lineal
  BarElement, // Controlador de barras
  Title, // Título del gráfico
  Tooltip, // Tooltip del gráfico
  Legend, // Leyenda del gráfico
  CategoryScale, // Escala de categorías para las etiquetas 
);

@Component({
  selector: 'app-motion',
  templateUrl: './motion.component.html',
  styleUrls: ['./motion.component.scss']
})
export class MotionComponent implements OnInit, OnDestroy, AfterViewInit {
  motionData: MotionData = {};
  private accelerationChart!: Chart;
  private gyroscopeChart!: Chart;

  constructor(private motionS: MotionService) { }

  ngOnInit(): void {
    // Inicia la detección de movimiento y asigna los datos al gráfico
    this.motionS.startMotionDetection((data: MotionData) => {
      this.motionData = data;
      this.updateCharts(); // Actualiza los gráficos con los nuevos datos
    });
  }

  ngAfterViewInit(): void {
    this.initCharts(); // Inicializa los gráficos después de que la vista se haya cargado
  }

  ngOnDestroy(): void {
    this.motionS.stopMotionDetection(); // Detiene la detección de movimiento al destruir el componente
  }

  private initCharts(): void {
    // Obtiene los elementos <canvas> para los gráficos
    const accCanvas = document.getElementById("accelerationChart") as HTMLCanvasElement;
    const gyroCanvas = document.getElementById("gyroscopeChart") as HTMLCanvasElement;

    if (!accCanvas || !gyroCanvas) {
      console.error("No se encontraron los elementos canvas.");
      return;
    }

    // Crea los gráficos
    this.accelerationChart = new Chart(accCanvas, this.getChartConfig("Acelerómetro", ['X', 'Y', 'Z']));
    this.gyroscopeChart = new Chart(gyroCanvas, this.getChartConfig("Giroscopio", ['Alpha', 'Beta', 'Gamma']));
  }

  private updateCharts(): void {
    // Actualiza los gráficos con los datos de aceleración
    if (this.accelerationChart && this.motionData.acceleration) {
      this.accelerationChart.data.datasets[0].data = [
        this.motionData.acceleration.x || 0,
        this.motionData.acceleration.y || 0,
        this.motionData.acceleration.z || 0
      ];
      this.accelerationChart.update();
    }

    // Actualiza los gráficos con los datos de giroscopio
    if (this.gyroscopeChart && this.motionData.rotation) {
      this.gyroscopeChart.data.datasets[0].data = [
        this.motionData.rotation.alpha || 0,
        this.motionData.rotation.beta || 0,
        this.motionData.rotation.gamma || 0
      ];
      this.gyroscopeChart.update();
    }
  }

  // Configuración del gráfico
  private getChartConfig(label: string, labels: string[]): ChartConfiguration {
    return {
      type: 'bar', // Gráfico de barras
      data: {
        labels: labels, // Etiquetas para el eje X
        datasets: [{
          label: label,
          data: [0, 0, 0], // Valores iniciales (serán actualizados más tarde)
          backgroundColor: ['#ff6384', '#ff9f40', '#ffcd56'],
          borderColor: ['#ff6384', '#ff9f40', '#ffcd56'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true, // Asegura que el gráfico sea responsive
        maintainAspectRatio: false, // Ajusta el tamaño del gráfico
        scales: {
          y: {
            type: 'linear', // Escala lineal para el eje Y
            beginAtZero: true // Comienza desde 0 en el eje Y
          }
        }
      }
    };
  }
}
