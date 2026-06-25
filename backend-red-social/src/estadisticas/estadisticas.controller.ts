import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { AutenticacionGuard } from '../autenticacion/autenticacion.guard';
import { AdminGuard } from '../autenticacion/admin.guard'; 

@Controller('estadisticas')
@UseGuards(AutenticacionGuard)
export class EstadisticasController {
  
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @UseGuards(AdminGuard)
  @Get()
  async obtenerEstadisticas(
    @Query('inicio') inicio: string,
    @Query('fin') fin: string,
  ) {
    // fechas por defecto
    const fechaInicio = inicio || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
    const fechaFin = fin || new Date().toISOString().split('T')[0];

    return this.estadisticasService.obtenerReportes(fechaInicio, fechaFin);
  }
}