import { describe, it, expect } from 'vitest';
import { validarCedula, obtenerDiaSemana, esFechaValida, esCitaDuplicada } from './validadores';

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

describe('validarCedula (casos extra)', () => {
  it('rechaza cédula vacía y con espacios', () => {
    expect(validarCedula('')).toBe(false);
    expect(validarCedula('131234567 ')).toBe(false);
  });
});

describe('esFechaValida (domingo y tildes)', () => {
  it('rechaza domingo aunque el médico lo tenga en su horario', () => {
    expect(esFechaValida('2026-11-15', { diasDisponibles: ['domingo', 'lunes'] })).toBe(false);
  });

  it('acepta días con tilde en el horario del médico', () => {
    expect(esFechaValida('2026-11-18', { diasDisponibles: ['miércoles'] })).toBe(true);
  });
});

describe('esCitaDuplicada', () => {
  const existentes = [
    { id_medico: 'm1', fecha: '2026-11-16', hora: '08:00:00', estado: 'Programada' },
    { id_medico: 'm1', fecha: '2026-11-18', hora: '09:00:00', estado: 'Cancelada' },
  ];

  it('detecta misma fecha, hora y médico', () => {
    expect(esCitaDuplicada({ id_medico: 'm1', fecha: '2026-11-16', hora: '08:00' }, existentes)).toBe(true);
  });

  it('permite otro horario o médico', () => {
    expect(esCitaDuplicada({ id_medico: 'm1', fecha: '2026-11-16', hora: '09:00' }, existentes)).toBe(false);
    expect(esCitaDuplicada({ id_medico: 'm2', fecha: '2026-11-16', hora: '08:00' }, existentes)).toBe(false);
  });

  it('ignora citas canceladas', () => {
    expect(esCitaDuplicada({ id_medico: 'm1', fecha: '2026-11-18', hora: '09:00' }, existentes)).toBe(false);
  });
});
