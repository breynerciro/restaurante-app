# backend/app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
import os

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Configuración
    app.config['SECRET_KEY'] = 'tu_clave_secreta_aqui'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///restaurantes.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Importar modelos después de inicializar db
    from .models import Restaurante, Reserva
    
    # Registrar blueprints
    from .routes import restaurantes_bp, reservas_bp
    app.register_blueprint(restaurantes_bp, url_prefix='/api')
    app.register_blueprint(reservas_bp, url_prefix='/api')
    
    # Crear tablas
    with app.app_context():
        db.create_all()
    
    return app
