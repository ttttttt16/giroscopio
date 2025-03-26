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
  private time: number[] = []; // Array para el tiempo
  private accelerationX: number[] = []; // Array para aceleración X
  private accelerationY: number[] = []; // Array para aceleración Y
  private accelerationZ: number[] = []; // Array para aceleración Z
  private alpha: number[] = []; // Array para alpha (giroscopio)
  private beta: number[] = []; // Array para beta (giroscopio)
  private gamma: number[] = []; // Array para gamma (giroscopio)

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
      console.error("No se encontró el elemento canvas.");
      return;
    }

    // Crea el gráfico de aceleración con tiempo
    this.accelerationChart = new Chart(accCanvas, this.getAccelerationChartConfig());

    // Crea el gráfico de giroscopio con tiempo
    this.gyroscopeChart = new Chart(gyroCanvas, this.getGyroscopeChartConfig());
  }

  private updateCharts(): void {
    // Agrega un nuevo punto de tiempo
    const currentTime = Date.now();

    // Añade el tiempo a la gráfica
    this.time.push(currentTime);

    // Añade los valores de aceleración a las gráficas
    if (this.motionData.acceleration) {
      this.accelerationX.push(this.motionData.acceleration.x || 0);
      this.accelerationY.push(this.motionData.acceleration.y || 0);
      this.accelerationZ.push(this.motionData.acceleration.z || 0);
    }

    // Añade los valores de giroscopio a las gráficas
    if (this.motionData.rotation) {
      this.alpha.push(this.motionData.rotation.alpha || 0);
      this.beta.push(this.motionData.rotation.beta || 0);
      this.gamma.push(this.motionData.rotation.gamma || 0);
    }

    // Limita la cantidad de datos en la gráfica para evitar que se sobrecargue
    if (this.time.length > 50) {
      this.time.shift();
      this.accelerationX.shift();
      this.accelerationY.shift();
      this.accelerationZ.shift();
      this.alpha.shift();
      this.beta.shift();
      this.gamma.shift();
    }

    // Actualiza los gráficos
    if (this.accelerationChart) {
      this.accelerationChart.data.labels = this.time.map(t => new Date(t).toLocaleTimeString()); // Muestra el tiempo en formato de hora
      this.accelerationChart.data.datasets[0].data = this.accelerationX;
      this.accelerationChart.data.datasets[1].data = this.accelerationY;
      this.accelerationChart.data.datasets[2].data = this.accelerationZ;
      this.accelerationChart.update();
    }

    if (this.gyroscopeChart) {
      this.gyroscopeChart.data.labels = this.time.map(t => new Date(t).toLocaleTimeString());
      this.gyroscopeChart.data.datasets[0].data = this.alpha;
      this.gyroscopeChart.data.datasets[1].data = this.beta;
      this.gyroscopeChart.data.datasets[2].data = this.gamma;
      this.gyroscopeChart.update();
    }
  }

  // Configuración del gráfico de aceleración
  private getAccelerationChartConfig(): ChartConfiguration {
    return {
      type: 'line',
      data: {
        labels: this.time.map(t => new Date(t).toLocaleTimeString()),
        datasets: [
          {
            label: 'Aceleración X',
            data: this.accelerationX,
            borderColor: '#ff6384',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
            tension: 0.1
          },
          {
            label: 'Aceleración Y',
            data: this.accelerationY,
            borderColor: '#ff9f40',
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            fill: true,
            tension: 0.1
          },
          {
            label: 'Aceleración Z',
            data: this.accelerationZ,
            borderColor: '#ffcd56',
            backgroundColor: 'rgba(255, 205, 86, 0.2)',
            fill: true,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            beginAtZero: true
          }
        }
      }
    };
  }

  // Configuración del gráfico de giroscopio
  private getGyroscopeChartConfig(): ChartConfiguration {
    return {
      type: 'line',
      data: {
        labels: this.time.map(t => new Date(t).toLocaleTimeString()),
        datasets: [
          {
            label: 'Alpha',
            data: this.alpha,
            borderColor: '#36a2eb',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            tension: 0.1
          },
          {
            label: 'Beta',
            data: this.beta,
            borderColor: '#4bc0c0',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.1
          },
          {
            label: 'Gamma',
            data: this.gamma,
            borderColor: '#ffcd56',
            backgroundColor: 'rgba(255, 205, 86, 0.2)',
            fill: true,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            beginAtZero: true
          }
        }
      }
    };
  }
}