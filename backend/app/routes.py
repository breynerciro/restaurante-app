from flask import Blueprint, request, jsonify
from app import db
from app.models import Restaurante, Reserva
from datetime import datetime, date
from sqlalchemy import and_

# Blueprints
restaurantes_bp = Blueprint('restaurantes', __name__)
reservas_bp = Blueprint('reservas', __name__)

# ==================== RUTAS DE RESTAURANTES ====================

@restaurantes_bp.route('/restaurantes', methods=['GET'])
def listar_restaurantes():
    """Listar todos los restaurantes"""
    try:
        restaurantes = Restaurante.query.all()
        return jsonify({
            'success': True,
            'data': [restaurante.to_dict() for restaurante in restaurantes]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@restaurantes_bp.route('/restaurantes/<int:restaurante_id>', methods=['GET'])
def obtener_restaurante(restaurante_id):
    """Obtener un restaurante por ID"""
    try:
        restaurante = Restaurante.query.get_or_404(restaurante_id)
        return jsonify({
            'success': True,
            'data': restaurante.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@restaurantes_bp.route('/restaurantes', methods=['POST'])
def crear_restaurante():
    """Crear un nuevo restaurante"""
    try:
        data = request.get_json()
        
        # Validar campos requeridos
        campos_requeridos = ['nombre', 'descripcion', 'direccion', 'ciudad', 'url_foto']
        for campo in campos_requeridos:
            if campo not in data or not data[campo]:
                return jsonify({
                    'success': False,
                    'error': f'El campo {campo} es requerido'
                }), 400
        
        # Crear restaurante
        restaurante = Restaurante(
            nombre=data['nombre'],
            descripcion=data['descripcion'],
            direccion=data['direccion'],
            ciudad=data['ciudad'],
            url_foto=data['url_foto']
        )
        
        db.session.add(restaurante)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': restaurante.to_dict(),
            'message': 'Restaurante creado exitosamente'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@restaurantes_bp.route('/restaurantes/<int:restaurante_id>', methods=['PUT'])
def actualizar_restaurante(restaurante_id):
    """Actualizar un restaurante"""
    try:
        restaurante = Restaurante.query.get_or_404(restaurante_id)
        data = request.get_json()
        
        # Actualizar campos
        if 'nombre' in data:
            restaurante.nombre = data['nombre']
        if 'descripcion' in data:
            restaurante.descripcion = data['descripcion']
        if 'direccion' in data:
            restaurante.direccion = data['direccion']
        if 'ciudad' in data:
            restaurante.ciudad = data['ciudad']
        if 'url_foto' in data:
            restaurante.url_foto = data['url_foto']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': restaurante.to_dict(),
            'message': 'Restaurante actualizado exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@restaurantes_bp.route('/restaurantes/<int:restaurante_id>', methods=['DELETE'])
def eliminar_restaurante(restaurante_id):
    """Eliminar un restaurante"""
    try:
        restaurante = Restaurante.query.get_or_404(restaurante_id)
        db.session.delete(restaurante)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Restaurante eliminado exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@restaurantes_bp.route('/restaurantes/filtrar', methods=['GET'])
def filtrar_restaurantes():
    """Filtrar restaurantes por letra inicial y ciudad"""
    try:
        letra = request.args.get('letra', '').upper()
        ciudad = request.args.get('ciudad', '')
        
        query = Restaurante.query
        
        if letra:
            query = query.filter(Restaurante.nombre.like(f'{letra}%'))
        
        if ciudad:
            query = query.filter(Restaurante.ciudad.ilike(f'%{ciudad}%'))
        
        restaurantes = query.all()
        
        return jsonify({
            'success': True,
            'data': [restaurante.to_dict() for restaurante in restaurantes]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== RUTAS DE RESERVAS ====================

@reservas_bp.route('/reservas', methods=['GET'])
def listar_reservas():
    """Listar todas las reservas"""
    try:
        reservas = Reserva.query.all()
        return jsonify({
            'success': True,
            'data': [reserva.to_dict() for reserva in reservas]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reservas_bp.route('/reservas', methods=['POST'])
def crear_reserva():
    """Crear una nueva reserva"""
    try:
        data = request.get_json()
        
        # Validar campos requeridos
        campos_requeridos = ['restaurante_id', 'nombre_cliente', 'email_cliente', 'telefono_cliente', 'fecha']
        for campo in campos_requeridos:
            if campo not in data or not data[campo]:
                return jsonify({
                    'success': False,
                    'error': f'El campo {campo} es requerido'
                }), 400
        
        # Validar que el restaurante existe
        restaurante = Restaurante.query.get(data['restaurante_id'])
        if not restaurante:
            return jsonify({
                'success': False,
                'error': 'El restaurante no existe'
            }), 404
        
        # Convertir fecha
        try:
            fecha_reserva = datetime.strptime(data['fecha'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Formato de fecha inválido. Use YYYY-MM-DD'
            }), 400
        
        # Validar que la fecha no sea en el pasado
        if fecha_reserva < date.today():
            return jsonify({
                'success': False,
                'error': 'No se pueden hacer reservas para fechas pasadas'
            }), 400
        
        # Validar límite de reservas por restaurante (15 máximo)
        reservas_restaurante = restaurante.reservas_por_fecha(fecha_reserva)
        if reservas_restaurante >= 1:
            return jsonify({
                'success': False,
                'error': 'El restaurante ya tiene el máximo de reservas para esta fecha (15)'
            }), 400
        
        # Validar límite total de reservas por día (20 máximo)
        reservas_totales = Reserva.reservas_totales_por_fecha(fecha_reserva)
        if reservas_totales >= 20:
            return jsonify({
                'success': False,
                'error': 'Se ha alcanzado el límite máximo de reservas para esta fecha (20)'
            }), 400
        
        # Crear reserva
        reserva = Reserva(
            restaurante_id=data['restaurante_id'],
            nombre_cliente=data['nombre_cliente'],
            email_cliente=data['email_cliente'],
            telefono_cliente=data['telefono_cliente'],
            fecha=fecha_reserva,
            hora=data.get('hora', '12:00'),
            numero_personas=data.get('numero_personas', 1)
        )
        
        db.session.add(reserva)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': reserva.to_dict(),
            'message': 'Reserva creada exitosamente'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reservas_bp.route('/reservas/<int:reserva_id>', methods=['DELETE'])
def cancelar_reserva(reserva_id):
    """Cancelar una reserva"""
    try:
        reserva = Reserva.query.get_or_404(reserva_id)
        db.session.delete(reserva)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Reserva cancelada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reservas_bp.route('/reservas/<int:reserva_id>/completar', methods=['PUT'])
def marcar_reserva_completada(reserva_id):
    """Marcar una reserva como completada"""
    try:
        reserva = Reserva.query.get_or_404(reserva_id)
        reserva.completada = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Reserva marcada como completada',
            'data': reserva.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reservas_bp.route('/reservas/completadas', methods=['DELETE'])
def eliminar_reservas_completadas():
    """Eliminar todas las reservas completadas"""
    try:
        reservas_completadas = Reserva.query.filter_by(completada=True).all()
        count = len(reservas_completadas)
        
        for reserva in reservas_completadas:
            db.session.delete(reserva)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'{count} reservas completadas eliminadas exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reservas_bp.route('/reservas/pendientes', methods=['GET'])
def listar_reservas_pendientes():
    """Listar solo las reservas pendientes (no completadas)"""
    try:
        reservas = Reserva.query.filter_by(completada=False).all()
        return jsonify({
            'success': True,
            'data': [reserva.to_dict() for reserva in reservas]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reservas_bp.route('/reservas/marcar-vencidas', methods=['PUT'])
def marcar_reservas_vencidas():
    """Marcar automáticamente las reservas vencidas como completadas"""
    try:
        from datetime import date
        
        # Obtener la fecha actual
        fecha_actual = date.today()
        
        # Buscar reservas vencidas (fecha anterior a hoy) que no estén completadas
        reservas_vencidas = Reserva.query.filter(
            and_(
                Reserva.fecha < fecha_actual,
                Reserva.completada == False
            )
        ).all()
        
        # Marcar como completadas
        count = 0
        for reserva in reservas_vencidas:
            reserva.completada = True
            count += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'{count} reservas vencidas marcadas como completadas',
            'count': count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reservas_bp.route('/reservas/eliminar-vencidas', methods=['DELETE'])
def eliminar_reservas_vencidas():
    """Eliminar automáticamente las reservas vencidas"""
    try:
        from datetime import date
        
        # Obtener la fecha actual
        fecha_actual = date.today()
        
        # Buscar reservas vencidas (fecha anterior a hoy) que no estén completadas
        reservas_vencidas = Reserva.query.filter(
            and_(
                Reserva.fecha < fecha_actual,
                Reserva.completada == False
            )
        ).all()
        
        # Eliminar reservas vencidas
        count = 0
        for reserva in reservas_vencidas:
            db.session.delete(reserva)
            count += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'{count} reservas vencidas eliminadas exitosamente',
            'count': count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reservas_bp.route('/reservas/restaurante/<int:restaurante_id>', methods=['GET'])
def reservas_por_restaurante(restaurante_id):
    """Obtener reservas de un restaurante específico"""
    try:
        restaurante = Restaurante.query.get_or_404(restaurante_id)
        reservas = Reserva.query.filter_by(restaurante_id=restaurante_id).all()
        
        return jsonify({
            'success': True,
            'data': [reserva.to_dict() for reserva in reservas]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500 