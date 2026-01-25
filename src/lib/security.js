// Sistema de seguridad local para la app de finanzas

const PIN_KEY = 'financia_pin_hash';
const PIN_ENABLED_KEY = 'financia_pin_enabled';
const FAILED_ATTEMPTS_KEY = 'financia_failed_attempts';
const LOCKOUT_UNTIL_KEY = 'financia_lockout_until';
const LAST_ACTIVITY_KEY = 'financia_last_activity';
const AUTO_LOCK_TIMEOUT_KEY = 'financia_auto_lock_timeout';

// Configuración
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutos
const DEFAULT_AUTO_LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutos de inactividad

// Hash simple para el PIN (en producción usarías bcrypt o similar)
// Usamos SHA-256 disponible en el navegador
async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'financia_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verificar si el PIN está habilitado
export function isPinEnabled() {
  return localStorage.getItem(PIN_ENABLED_KEY) === 'true';
}

// Configurar un nuevo PIN
export async function setupPin(pin) {
  if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
    throw new Error('El PIN debe ser de 4 a 6 dígitos numéricos');
  }

  const hashedPin = await hashPin(pin);
  localStorage.setItem(PIN_KEY, hashedPin);
  localStorage.setItem(PIN_ENABLED_KEY, 'true');
  localStorage.removeItem(FAILED_ATTEMPTS_KEY);
  localStorage.removeItem(LOCKOUT_UNTIL_KEY);

  return true;
}

// Verificar PIN
export async function verifyPin(pin) {
  // Verificar si está bloqueado
  const lockoutUntil = localStorage.getItem(LOCKOUT_UNTIL_KEY);
  if (lockoutUntil && Date.now() < parseInt(lockoutUntil)) {
    const remainingTime = Math.ceil((parseInt(lockoutUntil) - Date.now()) / 1000);
    throw new Error(`Demasiados intentos. Espera ${remainingTime} segundos.`);
  }

  const storedHash = localStorage.getItem(PIN_KEY);
  if (!storedHash) {
    throw new Error('No hay PIN configurado');
  }

  const inputHash = await hashPin(pin);

  if (inputHash === storedHash) {
    // PIN correcto - resetear intentos
    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_UNTIL_KEY);
    updateLastActivity();
    return true;
  } else {
    // PIN incorrecto
    const failedAttempts = parseInt(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '0') + 1;
    localStorage.setItem(FAILED_ATTEMPTS_KEY, failedAttempts.toString());

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      // Bloquear por tiempo
      localStorage.setItem(LOCKOUT_UNTIL_KEY, (Date.now() + LOCKOUT_DURATION).toString());
      throw new Error(`Demasiados intentos. Bloqueado por 5 minutos.`);
    }

    const remaining = MAX_FAILED_ATTEMPTS - failedAttempts;
    throw new Error(`PIN incorrecto. ${remaining} intento${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}.`);
  }
}

// Desactivar PIN
export async function disablePin(currentPin) {
  // Primero verificar el PIN actual
  await verifyPin(currentPin);

  localStorage.removeItem(PIN_KEY);
  localStorage.setItem(PIN_ENABLED_KEY, 'false');
  localStorage.removeItem(FAILED_ATTEMPTS_KEY);
  localStorage.removeItem(LOCKOUT_UNTIL_KEY);

  return true;
}

// Cambiar PIN
export async function changePin(currentPin, newPin) {
  // Verificar PIN actual
  await verifyPin(currentPin);

  // Configurar nuevo PIN
  await setupPin(newPin);

  return true;
}

// Obtener intentos fallidos restantes
export function getRemainingAttempts() {
  const failedAttempts = parseInt(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '0');
  return MAX_FAILED_ATTEMPTS - failedAttempts;
}

// Verificar si está bloqueado
export function isLocked() {
  const lockoutUntil = localStorage.getItem(LOCKOUT_UNTIL_KEY);
  if (lockoutUntil && Date.now() < parseInt(lockoutUntil)) {
    return {
      locked: true,
      remainingSeconds: Math.ceil((parseInt(lockoutUntil) - Date.now()) / 1000)
    };
  }
  return { locked: false, remainingSeconds: 0 };
}

// Actualizar última actividad
export function updateLastActivity() {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

// Verificar si debe auto-bloquear por inactividad
export function shouldAutoLock() {
  if (!isPinEnabled()) return false;

  const lastActivity = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || '0');
  const timeout = parseInt(localStorage.getItem(AUTO_LOCK_TIMEOUT_KEY) || DEFAULT_AUTO_LOCK_TIMEOUT.toString());

  return Date.now() - lastActivity > timeout;
}

// Configurar tiempo de auto-bloqueo
export function setAutoLockTimeout(minutes) {
  const timeout = minutes * 60 * 1000;
  localStorage.setItem(AUTO_LOCK_TIMEOUT_KEY, timeout.toString());
}

// Obtener tiempo de auto-bloqueo en minutos
export function getAutoLockTimeout() {
  const timeout = parseInt(localStorage.getItem(AUTO_LOCK_TIMEOUT_KEY) || DEFAULT_AUTO_LOCK_TIMEOUT.toString());
  return timeout / (60 * 1000);
}

// ============ BACKUP Y EXPORTACIÓN ============

const BACKUP_REMINDER_KEY = 'financia_last_backup';
const BACKUP_REMINDER_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 días

// Obtener todos los datos para backup
export function getAllDataForBackup() {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    appName: 'Financia Suite',
    data: {
      transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
      budgets: JSON.parse(localStorage.getItem('budgets') || '[]'),
      goals: JSON.parse(localStorage.getItem('goals') || '[]'),
      recurringExpenses: JSON.parse(localStorage.getItem('recurringExpenses') || '[]'),
      quickExpenseTemplates: JSON.parse(localStorage.getItem('quickExpenseTemplates') || '[]'),
      goalContributions: JSON.parse(localStorage.getItem('goalContributions') || '[]'),
      settings: {
        theme: localStorage.getItem('theme') || 'system',
        autoLockTimeout: getAutoLockTimeout()
      }
    }
  };

  return data;
}

// Exportar a JSON (backup completo)
export function exportToJSON() {
  const data = getAllDataForBackup();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `financia-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Actualizar fecha de último backup
  localStorage.setItem(BACKUP_REMINDER_KEY, Date.now().toString());

  return true;
}

// Exportar transacciones a CSV
export function exportToCSV() {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

  if (transactions.length === 0) {
    throw new Error('No hay transacciones para exportar');
  }

  // Headers
  const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Persona', 'Notas'];

  // Rows
  const rows = transactions.map(t => [
    t.date,
    t.type === 'income' ? 'Ingreso' : 'Gasto',
    t.category || '',
    t.description || '',
    t.amount,
    t.person || '',
    t.notes || ''
  ]);

  // Crear CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `financia-transacciones-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return true;
}

// Importar desde backup JSON
export function importFromBackup(jsonData) {
  try {
    const backup = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

    // Validar estructura
    if (!backup.data || !backup.version) {
      throw new Error('Formato de backup inválido');
    }

    // Restaurar datos
    if (backup.data.transactions) {
      localStorage.setItem('transactions', JSON.stringify(backup.data.transactions));
    }
    if (backup.data.budgets) {
      localStorage.setItem('budgets', JSON.stringify(backup.data.budgets));
    }
    if (backup.data.goals) {
      localStorage.setItem('goals', JSON.stringify(backup.data.goals));
    }
    if (backup.data.recurringExpenses) {
      localStorage.setItem('recurringExpenses', JSON.stringify(backup.data.recurringExpenses));
    }
    if (backup.data.quickExpenseTemplates) {
      localStorage.setItem('quickExpenseTemplates', JSON.stringify(backup.data.quickExpenseTemplates));
    }
    if (backup.data.goalContributions) {
      localStorage.setItem('goalContributions', JSON.stringify(backup.data.goalContributions));
    }

    return {
      success: true,
      stats: {
        transactions: backup.data.transactions?.length || 0,
        budgets: backup.data.budgets?.length || 0,
        goals: backup.data.goals?.length || 0
      }
    };
  } catch (error) {
    throw new Error('Error al restaurar backup: ' + error.message);
  }
}

// Verificar si necesita recordatorio de backup
export function needsBackupReminder() {
  const lastBackup = localStorage.getItem(BACKUP_REMINDER_KEY);
  if (!lastBackup) return true;

  const lastBackupTime = parseInt(lastBackup);
  return Date.now() - lastBackupTime > BACKUP_REMINDER_INTERVAL;
}

// Obtener días desde último backup
export function getDaysSinceLastBackup() {
  const lastBackup = localStorage.getItem(BACKUP_REMINDER_KEY);
  if (!lastBackup) return null;

  const lastBackupTime = parseInt(lastBackup);
  return Math.floor((Date.now() - lastBackupTime) / (24 * 60 * 60 * 1000));
}

// Posponer recordatorio de backup
export function postponeBackupReminder() {
  // Posponer por 1 día
  const oneDayAgo = Date.now() - (6 * 24 * 60 * 60 * 1000);
  localStorage.setItem(BACKUP_REMINDER_KEY, oneDayAgo.toString());
}

// ============ BORRAR DATOS ============

// Borrar todos los datos del usuario
export function deleteAllUserData() {
  // Lista de claves a eliminar
  const keysToDelete = [
    'transactions',
    'budgets',
    'goals',
    'recurringExpenses',
    'quickExpenseTemplates',
    'goalContributions',
    'dismissedReminders',
    'financia_last_backup'
  ];

  keysToDelete.forEach(key => {
    localStorage.removeItem(key);
  });

  return true;
}

// Borrar TODO incluyendo configuración de seguridad
export function deleteEverything() {
  const keysToDelete = [
    'transactions',
    'budgets',
    'goals',
    'recurringExpenses',
    'quickExpenseTemplates',
    'goalContributions',
    'dismissedReminders',
    'financia_last_backup',
    'financia_pin_hash',
    'financia_pin_enabled',
    'financia_failed_attempts',
    'financia_lockout_until',
    'financia_last_activity',
    'financia_auto_lock_timeout',
    'theme'
  ];

  keysToDelete.forEach(key => {
    localStorage.removeItem(key);
  });

  return true;
}
