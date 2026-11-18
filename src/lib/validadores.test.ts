import { describe, it, expect } from 'vitest';
import { validarCedula, obtenerDiaSemana, esFechaValida } from './validadores';

describe('validarCedula', () => {
  it('acepta una cédula de 10 dígitos', () => {
    expect(validarCedula('1312345678')).toBe(true);
  });

  it('rechaza una cédula con menos de 10 dígitos', () => {
    expect(validarCedula('123456789')).toBe(false);
  });

  it('rechaza una cédula con más de 10 dígitos', () => {
    expect(validarCedula('13123456789')).toBe(false);
  });

  it('rechaza una cédula que contiene letras', () => {
    expect(validarCedula('13123A5678')).toBe(false);
  });
});

describe('obtenerDiaSemana', () => {
  it('identifica correctamente un lunes', () => {
    expect(obtenerDiaSemana('2026-11-16')).toBe('lunes');
  });

  it('identifica correctamente un domingo', () => {
    expect(obtenerDiaSemana('2026-11-15')).toBe('domingo');
  });
});

describe('esFechaValida', () => {
  const medico = {
    diasDisponibles: ['lunes', 'miercoles', 'viernes'],
  };

  it('acepta una fecha cuando el médico está disponible', () => {
    expect(esFechaValida('2026-11-16', medico)).toBe(true);
  });

  it('rechaza una fecha cuando el médico no está disponible', () => {
    expect(esFechaValida('2026-11-17', medico)).toBe(false);
  });

  it('rechaza una fecha correspondiente a domingo', () => {
    expect(esFechaValida('2026-11-15', medico)).toBe(false);
  });
});
