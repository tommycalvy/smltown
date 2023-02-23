const publicUrl: string = import.meta.env.VITE_KRATOS_PUBLIC_URL;
const adminUrl: string = import.meta.env.VITE_KRATOS_ADMIN_URL;
const crudServiceUrl: string = import.meta.env.VITE_CRUD_SERVICE_URL;

export default {
    kratos: {
        admin: adminUrl,
        public: publicUrl,
    },
    crudService: {
        url: crudServiceUrl
    }
};