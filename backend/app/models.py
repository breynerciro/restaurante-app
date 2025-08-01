# backend/app/models.py
from datetime import datetime, date
from app import db
from sqlalchemy import and_

class Restaurante(db.Model):
    __tablename__ = 'restaurantes'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    direccion = db.Column(db.String(200), nullable=False)
    ciudad = db.Column(db.String(100), nullable=False)
    url_foto = db.Column(db.String(500), nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con reservas
    reservas = db.relationship('Reserva', backref='restaurante', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'direccion': self.direccion,
            'ciudad': self.ciudad,
            'url_foto': self.url_foto,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }
    
    def reservas_por_fecha(self, fecha):
        """Obtener el número de reservas para una fecha específica"""
        return Reserva.query.filter(
            and_(
                Reserva.restaurante_id == self.id,
                Reserva.fecha == fecha
            )
        ).count()
    
    @classmethod
    def get_by_id(cls, id):
        """Obtener restaurante por ID"""
        return cls.query.get(id)
    
    def __repr__(self):
        return f'<Restaurante {self.nombre}>'

class Reserva(db.Model):
    __tablename__ = 'reservas'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurante_id = db.Column(db.Integer, db.ForeignKey('restaurantes.id'), nullable=False)
    nombre_cliente = db.Column(db.String(100), nullable=False)
    email_cliente = db.Column(db.String(100), nullable=False)
    telefono_cliente = db.Column(db.String(20), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    hora = db.Column(db.String(5), nullable=False)  # formato HH:MM
    numero_personas = db.Column(db.Integer, nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    completada = db.Column(db.Boolean, default=False)  # Nuevo campo para marcar como completada
    
    def __init__(self, restaurante_id, nombre_cliente, email_cliente, telefono_cliente, fecha, hora, numero_personas):
        self.restaurante_id = restaurante_id
        self.nombre_cliente = nombre_cliente
        self.email_cliente = email_cliente
        self.telefono_cliente = telefono_cliente
        self.fecha = fecha
        self.hora = hora
        self.numero_personas = numero_personas
    
    def to_dict(self):
        return {
            'id': self.id,
            'restaurante_id': self.restaurante_id,
            'restaurante_nombre': self.restaurante.nombre if self.restaurante else None,
            'nombre_cliente': self.nombre_cliente,
            'email_cliente': self.email_cliente,
            'telefono_cliente': self.telefono_cliente,
            'fecha': self.fecha.isoformat() if self.fecha else None,
            'hora': self.hora,
            'numero_personas': self.numero_personas,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'completada': self.completada
        }
    
    @classmethod
    def get_all(cls):
        """Obtener todas las reservas"""
        return cls.query.all()
    
    @classmethod
    def get_by_id(cls, id):
        """Obtener reserva por ID"""
        return cls.query.get(id)
    
    @classmethod
    def get_by_restaurante_fecha(cls, restaurante_id, fecha):
        """Obtener reservas de un restaurante para una fecha específica"""
        return cls.query.filter(
            and_(
                cls.restaurante_id == restaurante_id,
                cls.fecha == fecha
            )
        ).all()
    
    @classmethod
    def get_by_fecha(cls, fecha):
        """Obtener todas las reservas para una fecha específica"""
        return cls.query.filter(cls.fecha == fecha).all()
    
    @classmethod
    def reservas_totales_por_fecha(cls, fecha):
        """Obtener el número total de reservas para una fecha específica"""
        return cls.query.filter(cls.fecha == fecha).count()
    
    @classmethod
    def delete(cls, id):
        """Eliminar una reserva por ID"""
        reserva = cls.query.get(id)
        if reserva:
            db.session.delete(reserva)
            db.session.commit()
            return True
        return False
    
    def __repr__(self):
        return f'<Reserva {self.id} - {self.nombre_cliente}>'
