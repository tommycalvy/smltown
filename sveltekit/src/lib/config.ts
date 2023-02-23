const publicUrl: string = import.meta.env.KRATOS_PUBLIC_URL;
const adminUrl: string = import.meta.env.KRATOS_ADMIN_URL;
const crudServiceUrl: string = import.meta.env.CRUD_SERVICE_URL;

import { KRATOS_PUBLIC_URL, KRATOS_ADMIN_URL, CRUD_SERVICE_URL } from '$env/static/private';

export default {
    kratos: {
        admin: adminUrl,
        public: publicUrl,
    },
    crudService: {
        url: crudServiceUrl
    }
};