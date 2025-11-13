import { supabase } from '../supabase';

export const userRolesService = {
  // ✅ Obtener SOLO empresas y usuarios con roles asignados (admin/empresa)
  async getAllUsers() {
    try {
      console.log('🔍 Iniciando consulta optimizada...');

      // 1. Obtener SOLO roles asignados (admin/empresa)
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .in('role', ['admin', 'empresa']); // ✅ Solo admin y empresa

      if (rolesError) throw rolesError;

      console.log('👔 Roles admin/empresa:', roles?.length || 0);

      // 2. Obtener empresas
      const { data: empresas, error: empresasError } = await supabase
        .from('empresas')
        .select('id, user_id, email, nombre, created_at');

      if (empresasError) throw empresasError;

      console.log('🏢 Empresas obtenidas:', empresas?.length || 0);

      // 3. Obtener emails para roles que no sean empresas
      const idsDeRoles = (roles || []).map(r => r.user_id);
      const idsDeEmpresas = (empresas || []).map(e => e.user_id);
      
      // IDs que están en roles pero NO en empresas
      const idsParaEmail = idsDeRoles.filter(id => !idsDeEmpresas.includes(id));

      console.log('📧 IDs para obtener email:', idsParaEmail.length);

      // Obtener emails en lote
      const emailsMap = new Map();
      await Promise.all(
        idsParaEmail.map(async (userId) => {
          const { data: email } = await supabase.rpc('get_user_email', { 
            p_user_id: userId 
          });
          if (email) {
            emailsMap.set(userId, email);
          }
        })
      );

      console.log('✅ Emails obtenidos:', emailsMap.size);

      // 4. Procesar empresas
      const empresasConRoles = (empresas || []).map(e => {
        const tieneRol = roles?.find(r => r.user_id === e.user_id);

        return {
          id: e.user_id,
          email: e.email,
          nombre: e.nombre || 'Sin nombre',
          tipo: 'empresa',
          role: tieneRol?.role || 'empresa',
          created_at: e.created_at,
          tiene_rol_asignado: !!tieneRol,
          origen: 'empresas'
        };
      });

      console.log('🏢 Empresas procesadas:', empresasConRoles.length);

      // 5. Procesar usuarios con roles (que NO son empresas)
      const usuariosConRol = (roles || [])
        .filter(rol => !idsDeEmpresas.includes(rol.user_id))
        .map(rol => {
          const email = emailsMap.get(rol.user_id);

          return {
            id: rol.user_id,
            email: email || 'Email no disponible',
            nombre: 'Usuario con rol',
            tipo: 'admin',
            role: rol.role,
            created_at: rol.created_at,
            tiene_rol_asignado: true,
            origen: 'user_roles'
          };
        });

      console.log('👔 Usuarios con rol admin:', usuariosConRol.length);

      // 6. Combinar todos usando ID como clave única
      const usuariosPorId = new Map();

      const agregarUsuario = (usuario) => {
        const key = usuario.id;

        if (usuariosPorId.has(key)) {
          const existente = usuariosPorId.get(key);
          
          // Agregar roles múltiples
          if (!existente.roles_multiples) {
            existente.roles_multiples = [existente.role];
          }
          if (!existente.roles_multiples.includes(usuario.role)) {
            existente.roles_multiples.push(usuario.role);
          }
          
          // Actualizar tipo combinado
          if (existente.tipo !== usuario.tipo) {
            existente.tipo = `${existente.tipo} + ${usuario.tipo}`;
          }
          
          // Usar nombre más completo
          if (existente.nombre === 'Usuario con rol' && usuario.nombre !== 'Usuario con rol') {
            existente.nombre = usuario.nombre;
          }

          // Actualizar rol asignado
          existente.tiene_rol_asignado = true;
        } else {
          usuariosPorId.set(key, usuario);
        }
      };

      // ✅ Agregar en orden: usuarios con rol → empresas
      usuariosConRol.forEach(agregarUsuario);
      empresasConRoles.forEach(agregarUsuario);

      const todosLosUsuarios = Array.from(usuariosPorId.values());

      console.log('✅ Total usuarios finales:', todosLosUsuarios.length);

      // Ordenar por fecha de creación (más recientes primero)
      todosLosUsuarios.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return { data: todosLosUsuarios, error: null };
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      return { data: null, error: error.message };
    }
  },

  // ✅ Asignar rol a un usuario por EMAIL
  async assignRoleByEmail(email, role, createdBy) {
    try {
      // Verificar que el rol sea válido
      const validRoles = ['admin', 'empresa', 'usuario'];
      if (!validRoles.includes(role)) {
        throw new Error(`Rol inválido. Debe ser: ${validRoles.join(', ')}`);
      }

      // Obtener user_id (UUID de auth.users) desde el email
      const { data: authUserId, error: rpcError } = await supabase.rpc('get_user_id_by_email', { 
        p_email: email 
      });

      if (rpcError) throw rpcError;

      if (!authUserId) {
        throw new Error(`No se encontró un usuario en auth.users con el email: ${email}`);
      }

      // Asignar el rol usando el user_id de auth.users
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: authUserId, // UUID de auth.users
          role: role,
          created_by: createdBy,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error al asignar rol:', error);
      return { data: null, error: error.message };
    }
  },

  // ✅ Asignar rol a un usuario por ID (auth.users.id)
  async assignRole(userId, role, createdBy) {
    try {
      const validRoles = ['admin', 'empresa', 'usuario'];
      if (!validRoles.includes(role)) {
        throw new Error(`Rol inválido. Debe ser: ${validRoles.join(', ')}`);
      }

      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId, // UUID de auth.users
          role: role,
          created_by: createdBy,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error al asignar rol:', error);
      return { data: null, error: error.message };
    }
  },

  // ✅ Eliminar rol
  async removeRole(userId) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId) // user_id de auth.users
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      return { data: null, error: error.message };
    }
  },

  // ✅ Verificar si un usuario es admin (por auth.users.id)
  async isAdmin(userId) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId) // user_id de auth.users
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { isAdmin: !!data, error: null };
    } catch (error) {
      console.error('Error al verificar admin:', error);
      return { isAdmin: false, error: error.message };
    }
  },

  // ✅ NUEVO: Buscar usuario específico por email (para casos especiales)
  async searchUserByEmail(email) {
    try {
      const { data: authUserId } = await supabase.rpc('get_user_id_by_email', { 
        p_email: email 
      });

      if (!authUserId) {
        return { data: null, error: 'Usuario no encontrado' };
      }

      // Buscar en usuarios
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('id, nombre, created_at')
        .eq('id', authUserId)
        .single();

      if (usuario) {
        return { 
          data: { 
            ...usuario, 
            email, 
            tipo: 'usuario' 
          }, 
          error: null 
        };
      }

      // Buscar en empresas
      const { data: empresa } = await supabase
        .from('empresas')
        .select('user_id, email, nombre, created_at')
        .eq('user_id', authUserId)
        .single();

      if (empresa) {
        return { 
          data: { 
            id: empresa.user_id,
            nombre: empresa.nombre,
            email: empresa.email,
            created_at: empresa.created_at,
            tipo: 'empresa' 
          }, 
          error: null 
        };
      }

      // Solo existe en auth
      return { 
        data: { 
          id: authUserId,
          nombre: 'Usuario de auth',
          email,
          tipo: 'auth_only' 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      return { data: null, error: error.message };
    }
  }
};