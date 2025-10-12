import { useState, useEffect } from "react";
import { BodegaCarruselEditor, DescriptionEditor, CardBodegas, AgregarMiniBodegaBtn } from "../../components/index";
import { Trash2, Save, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";

export function BodegaEditorProveedorScreen() {
  // Estados existentes actualizados para incluir todos los campos
  const [bodegas, setBodegas] = useState([
    { 
      metraje: "", 
      descripcion: "", 
      contenido: "", 
      imagen: null, 
      direccion: "",
      ciudad: "",
      zona: "",
      precioMensual: ""
    },
    { 
      metraje: "", 
      descripcion: "", 
      contenido: "", 
      imagen: null, 
      direccion: "",
      ciudad: "",
      zona: "",
      precioMensual: "" 
    }
  ]);
  const [empresa, setEmpresa] = useState("");
  const [imagenesCarrusel, setImagenesCarrusel] = useState([]);
  
  // ✅ NUEVOS ESTADOS para DescriptionEditor
  const [direccionGeneral, setDireccionGeneral] = useState("");
  const [descripcionGeneral, setDescripcionGeneral] = useState("");
  const [caracteristicas, setCaracteristicas] = useState("");
  const [imagenesDescripcion, setImagenesDescripcion] = useState([]);

  // Estados para el usuario autenticado
  const [usuario, setUsuario] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardandoTodo, setGuardandoTodo] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // ✅ NUEVOS ESTADOS para mejor UX
  const [mensaje, setMensaje] = useState({ tipo: null, texto: "" });
  const [eliminandoBodega, setEliminandoBodega] = useState(null);

  // ✅ Función para mostrar mensajes temporales
  const mostrarMensaje = (tipo, texto, duracion = 3000) => {
    setMensaje({ tipo, texto });
    setTimeout(() => {
      setMensaje({ tipo: null, texto: "" });
    }, duracion);
  };

  // Obtener usuario autenticado al cargar
  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (user) {
          setUsuario(user);
          
          // Verificar si ya tiene empresa creada
          const { data: empresaExistente, error: empresaError } = await supabase
            .from('empresas')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (empresaExistente) {
            setEmpresaId(empresaExistente.id);
            setEmpresa(empresaExistente.nombre);
            setPerfilCompleto(true);
            
            // Cargar imágenes del carrusel si existen
            const { data: imagenesExistentes } = await supabase
              .from('carrusel_imagenes')
              .select('imagen_url')
              .eq('empresa_id', empresaExistente.id)
              .order('orden');
              
            if (imagenesExistentes) {
              setImagenesCarrusel(imagenesExistentes.map(img => img.imagen_url));
            }

            // ✅ CORREGIR: Cargar mini bodegas existentes con todos los campos
            const { data: bodegasExistentes } = await supabase
              .from('mini_bodegas')
              .select('*')
              .eq('empresa_id', empresaExistente.id)
              .order('created_at');
              
            if (bodegasExistentes && bodegasExistentes.length > 0) {
              setBodegas(bodegasExistentes.map(b => ({
                id: b.id,
                metraje: b.metraje || "",
                descripcion: b.descripcion || "",
                contenido: b.contenido || "",
                imagen: b.imagen_url,
                direccion: b.direccion || "",
                ciudad: b.ciudad || "",
                zona: b.zona || "",
                precioMensual: b.precio_mensual ? b.precio_mensual.toString() : "",
                cantidad: b.cantidad || 1,
                maxCantidad: 99,
                nombrePersonalizado: b.nombre_personalizado || "" // ✅ AGREGAR NOMBRE PERSONALIZADO
              })));
            } else {
              // ✅ MODIFICAR estructura inicial para incluir nombre personalizado
              setBodegas([
                { 
                  metraje: "", 
                  descripcion: "", 
                  contenido: "", 
                  imagen: null, 
                  direccion: "", 
                  ciudad: "", 
                  zona: "", 
                  precioMensual: "", 
                  cantidad: 1, 
                  maxCantidad: 99,
                  nombrePersonalizado: "" // ✅ AGREGAR NOMBRE PERSONALIZADO
                },
                { 
                  metraje: "", 
                  descripcion: "", 
                  contenido: "", 
                  imagen: null, 
                  direccion: "", 
                  ciudad: "", 
                  zona: "", 
                  precioMensual: "", 
                  cantidad: 1, 
                  maxCantidad: 99,
                  nombrePersonalizado: "" // ✅ AGREGAR NOMBRE PERSONALIZADO
                }
              ]);
            }

            // Cargar descripción existente
            const { data: descripcionExistente } = await supabase
              .from('empresa_descripcion')
              .select('*')
              .eq('empresa_id', empresaExistente.id)
              .single();
              
            if (descripcionExistente) {
              setDireccionGeneral(descripcionExistente.direccion_general || "");
              setDescripcionGeneral(descripcionExistente.descripcion_general || "");
              setCaracteristicas(descripcionExistente.caracteristicas?.join(', ') || "");
              setImagenesDescripcion(descripcionExistente.imagenes_urls || []);
            }
          } else {
            // Si no hay empresa, mantener estructura inicial
            setBodegas([
              { 
                metraje: "", 
                descripcion: "", 
                contenido: "", 
                imagen: null, 
                direccion: "", 
                ciudad: "", 
                zona: "", 
                precioMensual: "", 
                cantidad: 1, 
                maxCantidad: 99,
                nombrePersonalizado: "" // ✅ AGREGAR NOMBRE PERSONALIZADO
              },
              { 
                metraje: "", 
                descripcion: "", 
                contenido: "", 
                imagen: null, 
                direccion: "", 
                ciudad: "", 
                zona: "", 
                precioMensual: "", 
                cantidad: 1, 
                maxCantidad: 99,
                nombrePersonalizado: "" // ✅ AGREGAR NOMBRE PERSONALIZADO
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error obteniendo usuario:', error);
        // En caso de error, mantener estructura inicial
        setBodegas([
          { 
            metraje: "", 
            descripcion: "", 
            contenido: "", 
            imagen: null, 
            direccion: "", 
            ciudad: "", 
            zona: "", 
            precioMensual: "", 
            cantidad: 1, 
            maxCantidad: 99,
            nombrePersonalizado: "" // ✅ AGREGAR NOMBRE PERSONALIZADO
          },
          { 
            metraje: "", 
            descripcion: "", 
            contenido: "", 
            imagen: null, 
            direccion: "", 
            ciudad: "", 
            zona: "", 
            precioMensual: "", 
            cantidad: 1, 
            maxCantidad: 99,
            nombrePersonalizado: "" // ✅ AGREGAR NOMBRE PERSONALIZADO
          }
        ]);
      } finally {
        setCargando(false);
      }
    };

    obtenerUsuario();
  }, []);

  // ✅ MODIFICAR: Agregar nueva bodega con nombre personalizado
  const handleAgregarBodega = () => {
    setBodegas([
      ...bodegas,
      { 
        metraje: "", 
        descripcion: "", 
        contenido: "", 
        imagen: null, 
        direccion: "",
        ciudad: "",
        zona: "",
        precioMensual: "",
        cantidad: 1,
        maxCantidad: 99,
        nombrePersonalizado: "" // ✅ AGREGAR NOMBRE PERSONALIZADO
      }
    ]);
    mostrarMensaje('success', '✅ Nueva mini bodega agregada');
  };

  // ✅ MEJORAR: Eliminar con confirmación
  const handleEliminarBodega = async (idx) => {
    const bodega = bodegas[idx];
    
    // ✅ Confirmación más profesional
    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres eliminar esta mini bodega?\n\n` +
      `📦 Metraje: ${bodega.metraje || 'Sin especificar'}\n` +
      `📝 Descripción: ${bodega.descripcion || 'Sin descripción'}\n` +
      `📍 Dirección: ${bodega.direccion || 'Sin dirección'}\n\n` +
      `⚠️ Esta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    setEliminandoBodega(idx);

    try {
      // Si tiene ID, eliminar de la base de datos
      if (bodega.id) {
        const { error } = await supabase
          .from('mini_bodegas')
          .delete()
          .eq('id', bodega.id);

        if (error) throw error;
      }

      // Eliminar del estado local
      setBodegas(bodegas.filter((_, i) => i !== idx));
      mostrarMensaje('success', '✅ Mini bodega eliminada correctamente');

    } catch (error) {
      console.error('Error eliminando mini bodega:', error);
      mostrarMensaje('error', `❌ Error eliminando mini bodega: ${error.message}`);
    } finally {
      setEliminandoBodega(null);
    }
  };

  // ✅ FUNCIÓN PARA ACTUALIZAR BODEGAS - CON DEBUG
  const handleUpdateBodega = (index, field, value) => {
    console.log(`🔄 BodegasEditor: Actualizando bodega ${index}, campo "${field}" a:`, value);
    
    setBodegas(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      console.log('📊 BodegasEditor: Bodega actualizada:', updated[index]);
      return updated;
    });
  };

  // Función para subir imagen a Supabase Storage
  const uploadImage = async (file) => {
    if (!file) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `mini-bodegas/${fileName}`;

      const { data, error } = await supabase.storage
        .from('imagenes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('imagenes')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Función para subir múltiples imágenes del carrusel
  const uploadCarruselImages = async (imagenes) => {
    const uploadPromises = imagenes.map(async (img, index) => {
      if (typeof img === 'string') {
        return img; // Ya es una URL
      }
      
      try {
        const fileExt = img.name.split('.').pop();
        const fileName = `${Date.now()}-${index}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `carrusel/${fileName}`;

        const { data, error } = await supabase.storage
          .from('imagenes')
          .upload(filePath, img, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('imagenes')
          .getPublicUrl(filePath);

        return publicUrl;
      } catch (error) {
        console.error(`Error uploading carrusel image ${index}:`, error);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null);
  };

  // Función para subir imágenes de descripción
  const uploadDescripcionImages = async (imagenes) => {
    if (!imagenes || imagenes.length === 0) return [];
    
    const uploadPromises = imagenes.map(async (img, index) => {
      if (typeof img === 'string') {
        return img; // Ya es una URL
      }
      
      try {
        const fileExt = img.name.split('.').pop();
        const fileName = `${Date.now()}-desc-${index}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `descripcion/${fileName}`;

        const { data, error } = await supabase.storage
          .from('imagenes')
          .upload(filePath, img, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('imagenes')
          .getPublicUrl(filePath);

        return publicUrl;
      } catch (error) {
        console.error(`Error uploading descripcion image ${index}:`, error);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null);
  };

  // 🚀 FUNCIÓN PRINCIPAL CORREGIDA con más debug específico
  const handleGuardarTodo = async () => {
    setGuardandoTodo(true);
    
    try {      
      console.log('💾 BodegasEditor: Iniciando guardado de todas las bodegas:', bodegas);
      
      // ✅ VALIDACIONES mejoradas con mensajes específicos
      if (!empresa.trim()) {
        mostrarMensaje('error', '❌ Por favor ingresa el nombre de la empresa');
        return;
      }

      if (!imagenesCarrusel || imagenesCarrusel.length === 0) {
        mostrarMensaje('error', '❌ Por favor agrega al menos una imagen del carrusel');
        return;
      }

      // ✅ FILTRAR bodegas válidas con debug
      const bodegasValidas = bodegas.filter(b => {
        const isValid = b.metraje && 
                       b.descripcion && 
                       b.contenido && 
                       b.direccion && 
                       b.ciudad && 
                       b.zona && 
                       b.precioMensual;
        
        if (!isValid) {
          console.warn('❌ Bodega inválida encontrada:', {
            metraje: !!b.metraje,
            descripcion: !!b.descripcion,
            contenido: !!b.contenido,
            direccion: !!b.direccion,
            ciudad: !!b.ciudad,
            zona: !!b.zona,
            precioMensual: !!b.precioMensual
          });
        }
        
        return isValid;
      });

      if (bodegasValidas.length === 0) {
        mostrarMensaje('error', '❌ Por favor completa al menos una mini bodega con todos los campos');
        return;
      }

      // Validar precios con más detalle
      for (let i = 0; i < bodegasValidas.length; i++) {
        const bodega = bodegasValidas[i];
        const precio = parseFloat(bodega.precioMensual);
        if (isNaN(precio) || precio <= 0) {
          mostrarMensaje('error', `❌ El precio "${bodega.precioMensual}" en la bodega ${i + 1} no es válido. Debe ser un número mayor a 0.`);
          return;
        }
      }

      // ✅ Mostrar progreso
      mostrarMensaje('info', '🔄 Guardando empresa...', 10000);

      // 🏢 PASO 1: Guardar/Actualizar empresa con debug
      let empresaData;
      
      if (empresaId) {
        const { data, error } = await supabase
          .from('empresas')
          .update({ 
            nombre: empresa.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', empresaId)
          .select();
        
        if (error) {
          console.error('❌ Error actualizando empresa:', error);
          throw error;
        }
        
        empresaData = data[0];
      
      } else {
        
        const { data, error } = await supabase
          .from('empresas')
          .insert([{
            nombre: empresa.trim(),
            user_id: usuario.id,
            ciudad: 'Bogotá'
          }])
          .select();
        
        if (error) {
          console.error('❌ Error creando empresa:', error);
          throw error;
        }
        
        empresaData = data[0];
        setEmpresaId(empresaData.id);
      }

      // 🖼️ PASO 2: Imágenes del carrusel (mantener igual)
      mostrarMensaje('info', '📸 Subiendo imágenes del carrusel...', 10000);

      const urlsCarrusel = await uploadCarruselImages(imagenesCarrusel);

      // ✅ Eliminar imágenes anteriores
      await supabase
        .from('carrusel_imagenes')
        .delete()
        .eq('empresa_id', empresaData.id);

      // ✅ Insertar nuevas imágenes
      if (urlsCarrusel.length > 0) {
        const carruselData = urlsCarrusel.map((url, index) => ({
          empresa_id: empresaData.id,
          imagen_url: url,
          orden: index,
          alt_text: `Imagen ${index + 1} de ${empresa}`
        }));

        const { error: carruselError } = await supabase
          .from('carrusel_imagenes')
          .insert(carruselData);

        if (carruselError) {
          console.error('❌ Error guardando carrusel:', carruselError);
          throw carruselError;
        }
      }

      // 📝 PASO 3: Descripción (mantener igual)
      mostrarMensaje('info', '📝 Guardando descripción...', 10000);
     
      
      const urlsDescripcion = await uploadDescripcionImages(imagenesDescripcion);
      
      const caracteristicasArray = caracteristicas 
        ? caracteristicas.split(',').map(c => c.trim()).filter(c => c.length > 0)
        : [];

      const { data: descripcionExistente } = await supabase
        .from('empresa_descripcion')
        .select('id')
        .eq('empresa_id', empresaData.id)
        .single();

      const descripcionData = {
        empresa_id: empresaData.id,
        direccion_general: direccionGeneral?.trim() || null,
        descripcion_general: descripcionGeneral?.trim() || null,
        caracteristicas: caracteristicasArray,
        imagenes_urls: urlsDescripcion
      };

      if (descripcionExistente) {
        const { error: descError } = await supabase
          .from('empresa_descripcion')
          .update(descripcionData)
          .eq('empresa_id', empresaData.id);

        if (descError) {
          console.error('❌ Error actualizando descripción:', descError);
          throw descError;
        }
      } else {
        const { error: descError } = await supabase
          .from('empresa_descripcion')
          .insert([descripcionData]);

        if (descError) {
          console.error('❌ Error insertando descripción:', descError);
          throw descError;
        }
      }
      
      // 📦 PASO 4: CORREGIDO - Clasificar bodegas correctamente
      mostrarMensaje('info', '📦 Guardando mini bodegas...', 10000);
     

      // ✅ OBTENER IDs QUE REALMENTE EXISTEN EN LA DB
      let idsRealesEnDB = [];
      try {
        const { data: bodegasEnDB, error: consultaError } = await supabase
          .from('mini_bodegas')
          .select('id')
          .eq('empresa_id', empresaData.id);

        if (consultaError) {
          console.error('❌ Error consultando IDs existentes:', consultaError);
          throw consultaError;
        }

        idsRealesEnDB = bodegasEnDB.map(b => b.id);
        
      } catch (error) {
        console.error('❌ Error obteniendo IDs de la DB:', error);
        throw error;
      }

      // ✅ CLASIFICAR CORRECTAMENTE: solo son "existentes" las que están realmente en la DB
      const bodegasExistentes = bodegasValidas.filter(b => b.id && idsRealesEnDB.includes(b.id));
      const bodegasNuevas = bodegasValidas.filter(b => !b.id || !idsRealesEnDB.includes(b.id));

      const todasLasBodegasGuardadas = [];

      // ✅ PROCESAR BODEGAS EXISTENTES (las que realmente están en DB)
      
      for (let i = 0; i < bodegasExistentes.length; i++) {
        const bodega = bodegasExistentes[i];
        
        mostrarMensaje('info', `📦 Actualizando bodega existente ${i + 1}/${bodegasExistentes.length}...`, 10000);
       
        let imagenUrl = bodega.imagen;
        if (bodega.imagen && typeof bodega.imagen !== 'string') {
          imagenUrl = await uploadImage(bodega.imagen);
        }

        const bodegaData = {
          metraje: bodega.metraje.trim(),
          descripcion: bodega.descripcion.trim(),
          contenido: bodega.contenido.trim(),
          direccion: bodega.direccion.trim(),
          ciudad: bodega.ciudad.trim(),
          zona: bodega.zona,
          precio_mensual: parseFloat(bodega.precioMensual),
          cantidad: parseInt(bodega.cantidad) || 1,
          nombre_personalizado: bodega.nombrePersonalizado?.trim() || null, // ✅ AGREGAR NOMBRE PERSONALIZADO
          imagen_url: imagenUrl,
          disponible: true,
          orden: i,
          updated_at: new Date().toISOString()
        };

        console.log(`💾 BodegasEditor: Datos a guardar en DB para bodega ${bodega.id}:`, bodegaData);

        const { data: bodegaActualizada, error: bodegaError } = await supabase
          .from('mini_bodegas')
          .update(bodegaData)
          .eq('id', bodega.id)
          .select();

        if (bodegaError) {
          console.error(`❌ ERROR actualizando bodega ${bodega.id}:`, bodegaError);
          throw bodegaError;
        }
        
        console.log(`✅ BodegasEditor: Bodega ${bodega.id} actualizada exitosamente:`, bodegaActualizada[0]);
        todasLasBodegasGuardadas.push(bodegaActualizada[0]);
      }

      // ✅ MODIFICAR: Procesar bodegas nuevas con nombre personalizado
      for (let i = 0; i < bodegasNuevas.length; i++) {
        const bodega = bodegasNuevas[i];
        
        console.log(`📦 BodegasEditor: Procesando bodega nueva ${i + 1}:`, {
          cantidad: bodega.cantidad,
          nombrePersonalizado: bodega.nombrePersonalizado,
          metraje: bodega.metraje
        });
        
        let imagenUrl = null;
        if (bodega.imagen) {
          if (typeof bodega.imagen === 'string') {
            imagenUrl = bodega.imagen;
          } else {
            try {
              imagenUrl = await uploadImage(bodega.imagen);
            } catch (imageError) {
              console.error(`❌ Error subiendo imagen bodega ${i + 1}:`, imageError);
              imagenUrl = null;
            }
          }
        }

        const bodegaData = {
          empresa_id: empresaData.id,
          metraje: bodega.metraje?.trim() || '',
          descripcion: bodega.descripcion?.trim() || '',
          contenido: bodega.contenido?.trim() || '',
          direccion: bodega.direccion?.trim() || '',
          ciudad: bodega.ciudad?.trim() || '',
          zona: bodega.zona || '',
          precio_mensual: parseFloat(bodega.precioMensual),
          cantidad: parseInt(bodega.cantidad) || 1,
          nombre_personalizado: bodega.nombrePersonalizado?.trim() || null, // ✅ AGREGAR NOMBRE PERSONALIZADO
          imagen_url: imagenUrl,
          disponible: true,
          orden: bodegasExistentes.length + i
        };
        
        console.log(`💾 BodegasEditor: Datos a guardar en DB para bodega nueva:`, bodegaData);

        // ✅ MODIFICAR validaciones (nombre personalizado es opcional)
        const camposFaltantes = [];
        if (!bodegaData.empresa_id) camposFaltantes.push('empresa_id');
        if (!bodegaData.metraje) camposFaltantes.push('metraje');
        if (!bodegaData.descripcion) camposFaltantes.push('descripcion');
        if (!bodegaData.contenido) camposFaltantes.push('contenido');
        if (!bodegaData.direccion) camposFaltantes.push('direccion');
        if (!bodegaData.ciudad) camposFaltantes.push('ciudad');
        if (!bodegaData.zona) camposFaltantes.push('zona');
        if (isNaN(bodegaData.precio_mensual) || bodegaData.precio_mensual <= 0) camposFaltantes.push('precio_mensual');
        if (isNaN(bodegaData.cantidad) || bodegaData.cantidad <= 0) camposFaltantes.push('cantidad');
        // ✅ nombre_personalizado es OPCIONAL, no validar

        if (camposFaltantes.length > 0) {
          console.error(`❌ CAMPOS FALTANTES EN BODEGA ${i + 1}:`, camposFaltantes);
          throw new Error(`Bodega ${i + 1} tiene campos faltantes: ${camposFaltantes.join(', ')}`);
        }

        const { data: bodegaGuardada, error: bodegaError } = await supabase
          .from('mini_bodegas')
          .insert([bodegaData])
          .select();

        if (bodegaError) {
          console.error(`❌ ERROR insertando bodega ${i + 1}:`, bodegaError);
          throw bodegaError;
        }

        console.log(`✅ BodegasEditor: Bodega nueva guardada exitosamente:`, bodegaGuardada[0]);
        todasLasBodegasGuardadas.push(bodegaGuardada[0]);
      }

      // ✅ MODIFICAR: Recargar con nombre personalizado
      const { data: bodegasFinales } = await supabase
        .from('mini_bodegas')
        .select('*')
        .eq('empresa_id', empresaData.id)
        .order('orden');

      if (bodegasFinales && bodegasFinales.length > 0) {
        setBodegas(bodegasFinales.map(b => ({
          id: b.id,
          metraje: b.metraje || "",
          descripcion: b.descripcion || "",
          contenido: b.contenido || "",
          imagen: b.imagen_url,
          direccion: b.direccion || "",
          ciudad: b.ciudad || "",
          zona: b.zona || "",
          precioMensual: b.precio_mensual ? b.precio_mensual.toString() : "",
          cantidad: b.cantidad || 1,
          maxCantidad: 99,
          nombrePersonalizado: b.nombre_personalizado || "" // ✅ CARGAR NOMBRE PERSONALIZADO
        })));
      }

      // Después de recargar las bodegas, también recargar la descripción
      const { data: descripcionActualizada } = await supabase
        .from('empresa_descripcion')
        .select('*')
        .eq('empresa_id', empresaId)
        .single();
      
      if (descripcionActualizada) {
        setDireccionGeneral(descripcionActualizada.direccion_general || "");
        setDescripcionGeneral(descripcionActualizada.descripcion_general || "");
        setCaracteristicas(
          descripcionActualizada.caracteristicas 
            ? descripcionActualizada.caracteristicas.join(', ')
            : ""
        );
        setImagenesDescripcion(descripcionActualizada.imagenes_urls || []);
      }
      
      // ✅ ÉXITO - Mensaje discreto y profesional
      setPerfilCompleto(true);
      mostrarMensaje('success', `✅ Perfil guardado correctamente (${bodegasFinales.length} mini bodegas)`);

    } catch (error) {
      console.error('💥 ERROR CRÍTICO EN PROCESO DE GUARDADO:', error);
      console.error('Stack trace:', error.stack);
      
      let mensajeError = 'Error desconocido';
      
      if (error.message.includes('violates foreign key constraint')) {
        mensajeError = 'Error de relación en la base de datos - verificar empresa_id';
      } else if (error.message.includes('duplicate key')) {
        mensajeError = 'Ya existe un registro con esos datos';
      } else if (error.message.includes('network')) {
        mensajeError = 'Error de conexión. Verifica tu internet';
      } else if (error.message.includes('storage')) {
        mensajeError = 'Error subiendo imágenes';
      } else if (error.message.includes('null value')) {
        mensajeError = 'Faltan campos obligatorios en la base de datos';
      } else {
        mensajeError = error.message;
      }
      
      mostrarMensaje('error', `❌ ${mensajeError}`, 10000);
    } finally {
      setGuardandoTodo(false);
    }
  };

  // ✅ MODIFICAR: Función de recarga con nombre personalizado
  const recargarDatos = async () => {
    if (!empresaId) return;
    
    setCargando(true);
    try {
      const { data: bodegasActualizadas } = await supabase
        .from('mini_bodegas')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('orden');
      
      if (bodegasActualizadas && bodegasActualizadas.length > 0) {
        setBodegas(bodegasActualizadas.map(b => ({
          id: b.id,
          metraje: b.metraje || "",
          descripcion: b.descripcion || "",
          contenido: b.contenido || "",
          imagen: b.imagen_url,
          direccion: b.direccion || "",
          ciudad: b.ciudad || "",
          zona: b.zona || "",
          precioMensual: b.precio_mensual ? b.precio_mensual.toString() : "",
          cantidad: b.cantidad || 1,
          maxCantidad: 99,
          nombrePersonalizado: b.nombre_personalizado || "" // ✅ CARGAR NOMBRE PERSONALIZADO
        })));
      } else {
        setBodegas([
          { 
            metraje: "", 
            descripcion: "", 
            contenido: "", 
            imagen: null, 
            direccion: "", 
            ciudad: "", 
            zona: "", 
            precioMensual: "", 
            cantidad: 1, 
            maxCantidad: 99,
            nombrePersonalizado: "" // ✅ NOMBRE PERSONALIZADO
          },
          { 
            metraje: "", 
            descripcion: "", 
            contenido: "", 
            imagen: null, 
            direccion: "", 
            ciudad: "", 
            zona: "", 
            precioMensual: "", 
            cantidad: 1, 
            maxCantidad: 99,
            nombrePersonalizado: "" // ✅ NOMBRE PERSONALIZADO
          }
        ]);
      }

      // Recargar carrusel
      const { data: carruselActualizado } = await supabase
        .from('carrusel_imagenes')
        .select('imagen_url, orden')
        .eq('empresa_id', empresaId)
        .order('orden');
      
      if (carruselActualizado) {
        setImagenesCarrusel(carruselActualizado.map(img => img.imagen_url));
      }

      // Recargar descripción
      const { data: descripcionActualizada } = await supabase
        .from('empresa_descripcion')
        .select('*')
        .eq('empresa_id', empresaId)
        .single();
      
      if (descripcionActualizada) {
        setDireccionGeneral(descripcionActualizada.direccion_general || "");
        setDescripcionGeneral(descripcionActualizada.descripcion_general || "");
        setCaracteristicas(
          descripcionActualizada.caracteristicas 
            ? descripcionActualizada.caracteristicas.join(', ')
            : ""
        );
        setImagenesDescripcion(descripcionActualizada.imagenes_urls || []);
      }
      
    } catch (error) {
      console.error('Error recargando datos:', error);
      mostrarMensaje('error', `❌ Error recargando datos: ${error.message}`, 5000);
    } finally {
      setCargando(false);
    }
  };

  // ✅ Componente para mostrar mensajes
  const MensajeEstado = () => {
    if (!mensaje.tipo) return null;

    const estilos = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    };

    const iconos = {
      success: <CheckCircle className="h-5 w-5" />,
      error: <AlertTriangle className="h-5 w-5" />,
      info: <Loader2 className="h-5 w-5 animate-spin" />,
      warning: <AlertTriangle className="h-5 w-5" />
    };

    return (
      <div className={`fixed top-4 right-4 z-50 p-4 border rounded-lg shadow-lg max-w-md ${estilos[mensaje.tipo]}`}>
        <div className="flex items-center">
          {iconos[mensaje.tipo]}
          <span className="ml-2 font-medium">{mensaje.texto}</span>
        </div>
      </div>
    );
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-[#2C3A61]" />
          <p className="text-[#2C3A61]">Cargando perfil de proveedor...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ No estás autenticado</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-[#2C3A61] text-white px-6 py-2 rounded-lg"
          >
            Ir a Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Componente de mensajes */}
      <MensajeEstado />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* ✅ Header con nombre de empresa en lugar de correo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#2C3A61] mb-2">
            👋 Bienvenido, {empresa || 'Proveedor'}
          </h1>
          <p className="text-gray-600">
            {perfilCompleto ? 'Edita tu perfil de proveedor' : 'Completa tu perfil de proveedor de mini bodegas'}
          </p>
          {/* ✅ OPCIONAL: Mostrar correo como subtítulo pequeño */}
          {empresa && (
            <p className="text-sm text-gray-400 mt-1">
              {usuario?.email}
            </p>
          )}
        </div>

        {/* SECCIÓN 1: Empresa y Carrusel */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-[#2C3A61]">
            🏢 Información de la Empresa
          </h2>
          
          <BodegaCarruselEditor 
            empresaId={empresaId}
            empresa={empresa}
            onEmpresaChange={setEmpresa}
            imagenes={imagenesCarrusel}
            onImagenesChange={setImagenesCarrusel}
          />
        </div>

        {/* SECCIÓN 2: Descripción General */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-[#2C3A61]">
            📋 Descripción General
          </h2>
          
          <DescriptionEditor 
            empresa={empresa}
            onEmpresaChange={setEmpresa}
            direccion={direccionGeneral}
            onDireccionChange={setDireccionGeneral}
            descripcion={descripcionGeneral}
            onDescripcionChange={setDescripcionGeneral}
            caracteristicas={caracteristicas}
            onCaracteristicasChange={setCaracteristicas}
            imagenes={imagenesDescripcion}
            onImagenesChange={setImagenesDescripcion}
          />
        </div>
        
        {/* SECCIÓN 3: Mini Bodegas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-[#2C3A61]">
            📦 Mini Bodegas
          </h2>
          
          {/* Grid responsive para las cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
            {bodegas.map((bodega, idx) => (
              <div key={idx} className="flex flex-col items-center w-full max-w-sm">
                <CardBodegas
                  metraje={bodega.metraje}
                  descripcion={bodega.descripcion}
                  contenido={bodega.contenido}
                  imagen={bodega.imagen}
                  direccion={bodega.direccion}
                  ciudad={bodega.ciudad}
                  zona={bodega.zona}
                  precioMensual={bodega.precioMensual}
                  cantidad={bodega.cantidad}
                  maxCantidad={bodega.maxCantidad}
                  nombrePersonalizado={bodega.nombrePersonalizado} // ✅ PASAR NOMBRE PERSONALIZADO
                  hideGuardarButton={true}
                  onImagenChange={img => handleUpdateBodega(idx, "imagen", img)}
                  onMetrajeChange={val => handleUpdateBodega(idx, "metraje", val)}
                  onDescripcionChange={val => handleUpdateBodega(idx, "descripcion", val)}
                  onContenidoChange={val => handleUpdateBodega(idx, "contenido", val)}
                  onDireccionChange={val => handleUpdateBodega(idx, "direccion", val)}
                  onCiudadChange={val => handleUpdateBodega(idx, "ciudad", val)}
                  onZonaChange={val => handleUpdateBodega(idx, "zona", val)}
                  onPrecioMensualChange={val => handleUpdateBodega(idx, "precioMensual", val)}
                  onCantidadChange={val => handleUpdateBodega(idx, "cantidad", val)}
                  onNombrePersonalizadoChange={val => handleUpdateBodega(idx, "nombrePersonalizado", val)} // ✅ HANDLER NOMBRE PERSONALIZADO
                />
                
                {/* ✅ Botón eliminar mejorado */}
                <button
                  className={`mt-4 rounded-full p-2 transition-all duration-200 ${
                    eliminandoBodega === idx 
                      ? 'bg-red-200 cursor-not-allowed' 
                      : 'bg-red-100 hover:bg-red-200 hover:scale-105'
                  }`}
                  onClick={() => handleEliminarBodega(idx)}
                  disabled={eliminandoBodega === idx}
                  title="Eliminar mini bodega"
                >
                  {eliminandoBodega === idx ? (
                    <Loader2 className="h-5 w-5 text-red-600 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5 text-red-600" />
                  )}
                </button>
              </div>
            ))}
            
            {/* Botón agregar */}
            <div className="flex flex-col items-center w-full max-w-sm">
              <AgregarMiniBodegaBtn onClick={handleAgregarBodega} />
            </div>
          </div>
        </div>
        
        {/* ✅ BOTÓN PRINCIPAL mejorado */}
        <div className="flex justify-center mt-8">
          <button
            className={`font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg flex items-center justify-center min-w-[300px] ${
              guardandoTodo
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#2C3A61] text-white hover:bg-[#4B799B] hover:scale-105'
            }`}
            onClick={handleGuardarTodo}
            disabled={guardandoTodo}
          >
            {guardandoTodo ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-3" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-3" />
                {perfilCompleto ? 'Actualizar Perfil' : 'Guardar Todo'}
              </>
            )}
          </button>
        </div>

        {/* ✅ Botón de recarga mejorado */}
        {perfilCompleto && (
          <div className="text-center mt-4">
            <button
              onClick={recargarDatos}
              className="text-[#2C3A61] hover:text-[#4B799B] transition-colors text-sm flex items-center justify-center mx-auto"
              disabled={cargando}
            >
              {cargando ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <span className="mr-2">🔄</span>
              )}
              Recargar datos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}