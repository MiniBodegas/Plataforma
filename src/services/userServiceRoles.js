import { supabase } from '../supabase';

export const userRolesService = {
  // ✅ Obtener TODOS los correos de usuarios y empresas
  async getAllUsers() {
    try {
      // 1. Obtener usuarios de tabla usuarios (id = auth.users.id)
      const { data: usuarios, error: usuariosError } = await supabase
        .from('usuarios')
        .select('id, nombre, created_at');

      if (usuariosError) throw usuariosError;

      console.log('📊 Usuarios obtenidos:', usuarios?.length || 0);

      // 2. Obtener empresas
      const { data: empresas, error: empresasError } = await supabase
        .from('empresas')
        .select('id, user_id, email, nombre, created_at');

      if (empresasError) throw empresasError;

      console.log('🏢 Empresas obtenidas:', empresas?.length || 0);

      // 3. Obtener roles asignados (user_id = auth.users.id)
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at');

      if (rolesError) throw rolesError;

      console.log('👔 Roles asignados:', roles?.length || 0);

      // 4. Obtener emails para TODOS (usuarios + empresas sin email + roles)
      const todosLosIds = new Set([
        ...(usuarios || []).map(u => u.id),
        ...(empresas || []).filter(e => !e.email).map(e => e.user_id),
        ...(roles || []).map(r => r.user_id) // ✅ AGREGAR IDs de roles
      ]);

      const idsParaEmail = Array.from(todosLosIds);

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
      console.log('📧 Emails Map:', Array.from(emailsMap.entries()));

      // 5. Procesar usuarios de tabla usuarios
      const usuariosConEmail = (usuarios || []).map(u => {
        const tieneRol = roles?.find(r => r.user_id === u.id);
        const email = emailsMap.get(u.id);
        
        return {
          id: u.id,
          email: email || 'Email no disponible',
          nombre: u.nombre || 'Sin nombre',
          tipo: 'usuario',
          role: tieneRol?.role || 'usuario',
          created_at: u.created_at,
          tiene_rol_asignado: !!tieneRol,
          origen: 'usuarios'
        };
      });

      console.log('👥 Usuarios de tabla usuarios:', usuariosConEmail.length);

      // 6. Procesar empresas
      const empresasConEmail = (empresas || []).map(e => {
        const tieneRol = roles?.find(r => r.user_id === e.user_id);
        
        return {
          id: e.user_id,
          email: e.email || emailsMap.get(e.user_id) || 'Email no disponible',
          nombre: e.nombre || 'Sin nombre',
          tipo: 'empresa',
          role: tieneRol?.role || 'empresa',
          created_at: e.created_at,
          tiene_rol_asignado: !!tieneRol,
          origen: 'empresas'
        };
      });

      console.log('🏢 Empresas procesadas:', empresasConEmail.length);

      // 7. Procesar TODOS los roles (mostrar usuarios que solo tienen rol pero no están en otras tablas)
      const idsEnOtrasTTablas = new Set([
        ...(usuarios || []).map(u => u.id),
        ...(empresas || []).map(e => e.user_id)
      ]);

      const usuariosSoloConRol = [];
      for (const rol of (roles || [])) {
        if (!idsEnOtrasTTablas.has(rol.user_id)) {
          const email = emailsMap.get(rol.user_id);

          usuariosSoloConRol.push({
            id: rol.user_id,
            email: email || 'Email no disponible',
            nombre: 'Usuario de auth', // ✅ Indicar que solo existe en auth
            tipo: 'auth_only', // ✅ Nuevo tipo
            role: rol.role,
            created_at: rol.created_at,
            tiene_rol_asignado: true,
            origen: 'user_roles'
          });
        }
      }

      console.log('👔 Usuarios solo con rol (auth_only):', usuariosSoloConRol.length);
      console.log('👔 Detalles:', usuariosSoloConRol);

      // 8. Combinar todos usando ID como clave única
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
          if ((!existente.nombre || existente.nombre === 'Sin nombre' || existente.nombre === 'Usuario de auth') 
              && usuario.nombre && usuario.nombre !== 'Sin nombre' && usuario.nombre !== 'Usuario de auth') {
            existente.nombre = usuario.nombre;
          }

          // Usar email más completo
          if (existente.email === 'Email no disponible' && usuario.email !== 'Email no disponible') {
            existente.email = usuario.email;
          }

          // Actualizar rol asignado
          if (usuario.tiene_rol_asignado) {
            existente.tiene_rol_asignado = true;
          }
        } else {
          usuariosPorId.set(key, usuario);
        }
      };

      // ✅ Agregar en orden: roles → usuarios → empresas
      usuariosSoloConRol.forEach(agregarUsuario);
      usuariosConEmail.forEach(agregarUsuario);
      empresasConEmail.forEach(agregarUsuario);

      const todosLosUsuarios = Array.from(usuariosPorId.values());

      console.log('✅ Total usuarios finales:', todosLosUsuarios.length);
      console.log('📋 Usuarios finales:', todosLosUsuarios);

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
      const { data: authUserId } = await supabase.rpc('get_user_id_by_email', { 
        p_email: email 
      });

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
        throw new Error(`Rol inválido. Debe ser: ${validRoles.join('. ')}`);
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
  }
};