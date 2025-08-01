import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Chip,
  Divider,
  FAB,
} from 'react-native-paper';
import { reservasService } from '../services/api';

const ReservasScreen = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarReservas();
    // Eliminar automáticamente las reservas vencidas al cargar la pantalla
    eliminarReservasVencidas();
  }, []);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      const response = await reservasService.getPendientes();
      if (response.success) {
        setReservas(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarReservas();
    setRefreshing(false);
  };

  const cancelarReserva = async (id) => {
    Alert.alert(
      'Confirmar cancelación',
      '¿Estás seguro de que quieres cancelar esta reserva?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              await reservasService.cancel(id);
              Alert.alert('Éxito', 'Reserva cancelada correctamente');
              cargarReservas();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            }
          },
        },
      ]
    );
  };

  const marcarCompletada = async (id) => {
    Alert.alert(
      'Confirmar completada',
      '¿Estás seguro de que quieres marcar esta reserva como completada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await reservasService.marcarCompletada(id);
              Alert.alert('Éxito', 'Reserva marcada como completada');
              cargarReservas();
            } catch (error) {
              Alert.alert('Error', 'No se pudo marcar la reserva como completada');
            }
          },
        },
      ]
    );
  };

  const eliminarCompletadas = async () => {
    Alert.alert(
      'Eliminar reservas completadas',
      '¿Estás seguro de que quieres eliminar todas las reservas completadas? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await reservasService.eliminarCompletadas();
              Alert.alert('Éxito', response.message);
              cargarReservas();
            } catch (error) {
              Alert.alert('Error', 'No se pudieron eliminar las reservas completadas');
            }
          },
        },
      ]
    );
  };

  const eliminarReservasVencidas = async () => {
    try {
      const response = await reservasService.eliminarVencidas();
      if (response.success && response.count > 0) {
        console.log(`Se eliminaron ${response.count} reservas vencidas automáticamente`);
        // Mostrar mensaje informativo
        Alert.alert(
          'Limpieza automática',
          `Se eliminaron ${response.count} reserva(s) con fecha(s) pasada(s) automáticamente.`,
          [{ text: 'OK' }]
        );
        // Recargar las reservas después de eliminar las vencidas
        cargarReservas();
      }
    } catch (error) {
      console.error('Error al eliminar reservas vencidas:', error);
    }
  };

  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const obtenerEstadoReserva = (fechaString) => {
    const fecha = new Date(fechaString);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Si la fecha es anterior a hoy, está vencida
    if (fecha < hoy) {
      return { texto: 'Hoy', color: 'red', vencida: true };
    }
    // Si la fecha es hoy
    else if (fecha.getTime() === hoy.getTime()) {
      return { texto: 'Hoy', color: 'orange', vencida: false };
    }
    // Si la fecha es futura
    else {
      return { texto: 'Próxima', color: 'blue', vencida: false };
    }
  };

  const reservasOrdenadas = [...reservas].sort((a, b) => {
    const fechaA = new Date(a.fecha);
    const fechaB = new Date(b.fecha);
    return fechaA - fechaB;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {reservasOrdenadas.length > 0 ? (
          reservasOrdenadas.map((reserva) => {
            const estado = obtenerEstadoReserva(reserva.fecha);
            return (
              <Card key={reserva.id} style={[
                styles.card,
                estado.vencida && styles.vencidaCard
              ]}>
                <Card.Content>
                  <View style={styles.headerRow}>
                    <Title style={styles.restaurantName}>
                      {reserva.restaurante_nombre}
                    </Title>
                    <Chip
                      mode="outlined"
                      textStyle={{ color: estado.color }}
                      style={[styles.statusChip, { borderColor: estado.color }]}
                    >
                      {estado.texto}
                    </Chip>
                  </View>
                  
                  <Divider style={styles.divider} />
                  
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>📅 Fecha:</Text>
                      <Text style={styles.value}>{formatearFecha(reserva.fecha)}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>🕐 Hora:</Text>
                      <Text style={styles.value}>{reserva.hora}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>👥 Personas:</Text>
                      <Text style={styles.value}>{reserva.numero_personas}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>👤 Cliente:</Text>
                      <Text style={styles.value}>{reserva.nombre_cliente}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>📧 Email:</Text>
                      <Text style={styles.value}>{reserva.email_cliente}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>📞 Teléfono:</Text>
                      <Text style={styles.value}>{reserva.telefono_cliente}</Text>
                    </View>
                  </View>
                </Card.Content>
                
                <Card.Actions>
                  <Button
                    onPress={() => marcarCompletada(reserva.id)}
                    mode="contained"
                    style={[styles.actionButton, styles.completeButton]}
                    disabled={estado.texto === 'Completada'}
                  >
                    Completada
                  </Button>
                  <Button
                    onPress={() => cancelarReserva(reserva.id)}
                    mode="outlined"
                    style={[styles.actionButton, styles.cancelButton]}
                    disabled={estado.vencida}
                  >
                    {estado.vencida ? 'Vencida' : 'Cancelar'}
                  </Button>
                </Card.Actions>
              </Card>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes reservas pendientes</Text>
            <Text style={styles.emptySubtext}>
              Ve a la pestaña "Nueva Reserva" para crear tu primera reserva
            </Text>
          </View>
        )}
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  vencidaCard: {
    backgroundColor: '#ffebee', // Light red background for expired
    borderColor: '#ef5350', // Red border for expired
    borderWidth: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    flex: 1,
    fontSize: 18,
  },
  statusChip: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: 12,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
    flex: 1,
  },
  value: {
    flex: 2,
    textAlign: 'right',
  },
  cancelButton: {
    flex: 1,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#999',
    lineHeight: 20,
  },
  actionButton: {
    marginHorizontal: 8,
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#4CAF50', // Green color for completed
  },
  vencidaButton: {
    backgroundColor: '#ef5350', // Red color for deleting expired
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#f44336', // Color rojo para indicar eliminación
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  fabLeft: {
    left: 0,
  },
  fabRight: {
    right: 0,
  },
});

export default ReservasScreen; 