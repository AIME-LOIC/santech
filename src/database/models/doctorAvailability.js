import {DataTypes ,Model} from 'sequelize'
import sequelize from '../../config/db.js'
class DoctorAvailability extends Model {}

DoctorAvailability.init({
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
    availableDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    availableTimeSlots: {
        type: DataTypes.JSON,
        allowNull: false,
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
    modelName: 'DoctorAvailability',
    tableName: 'doctor_availability',
    timestamps: true,
}
)
export default DoctorAvailability;