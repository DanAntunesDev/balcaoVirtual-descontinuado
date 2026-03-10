export const PERMISSIONS = {
  superadmin: {
    usuarios: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      changeStatus: true,
    },
    cartorios: {
      view: true,
      create: true,
      edit: true,
      delete: true,
    },
  },

  admin: {
    usuarios: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      changeStatus: true,
    },
    cartorios: {
      view: true,
      create: false,
      edit: false,
      delete: false,
    },
  },

  cliente: {
    usuarios: {
      view: false,
    },
    cartorios: {
      view: true,
    },
  },
};
