import React from 'react'
import Registro from '../Register'
import RegistroEmpleado from '../../components/RegisterEmpleado'
import AdminEmpleados from '../../components/AdminEmpleados'
import GestionEmpleados from '../../components/GestionEmpleados'

function Admin() {
    return (<>
        <RegistroEmpleado />
        <GestionEmpleados></GestionEmpleados>
    </>)
}

export default Admin