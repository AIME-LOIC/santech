import {DataTypes ,Model} from 'sequelize'
import sequelize from '../../config/db.js'

class appointment extends Model {}

appointment.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    appointmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    appointmentTime: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'scheduled',
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
},
{    
    sequelize,
    modelName: 'appointment',
    tableName: 'appointments',
    timestamps: true,
}
)
export default appointment;