import Role from "../../models/Role.js";

const respond = (res, status, data, message = '') => {
    const response = { status };
    if (data) response.data = data;
    if (message) response.message = message;
    return res.status(status).json(response);
};

export const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.findAll();
        respond(res, 200, roles);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch roles: ${error.message}`);
    }
};

export const getRoleById = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) {
            return respond(res, 404, null, 'Role not found');
        }
        respond(res, 200, role);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch role: ${error.message}`);
    }
};

export const createRole = async (req, res) => {
    try {
        const { role_label } = req.body;

        if (!role_label) {
            return respond(res, 400, null, 'role_label is required');
        }

        const role = await Role.create({ role_label });
        respond(res, 201, role, 'Role created successfully');
    } catch (error) {
        respond(res, 400, null, `Failed to create role: ${error.message}`);
    }
};

export const updateRole = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) {
            return respond(res, 404, null, 'Role not found');
        }

        await role.update(req.body);
        respond(res, 200, role, 'Role updated successfully');
    } catch (error) {
        respond(res, 400, null, `Failed to update role: ${error.message}`);
    }
};

export const deleteRole = async (req, res) => {
    try {
        const deleted = await Role.destroy({ where: { role_id: req.params.id } });
        if (!deleted) {
            return respond(res, 404, null, 'Role not found');
        }
        respond(res, 200, null, 'Role deleted successfully');
    } catch (error) {
        respond(res, 500, null, `Failed to delete role: ${error.message}`);
    }
};