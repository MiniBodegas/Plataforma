import { useState, useEffect } from "react";
import { BodegaCarruselEditor, DescriptionEditor, CardBodegas, AgregarMiniBodegaBtn } from "../../components/index";
import { Trash2, Save, Loader2 } from "lucide-react";
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
      precioMensual: "" // ✅ Asegurar que está incluido
    },
    { 
      metraje: "", 
      descripcion: "", 
      contenido: "", 
      imagen: null, 
      direccion: "",
      ciudad: "",
      zona: "",
      precioMensual: "" // ✅ Asegurar que está incluido
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

  // Obtener usuario autenticado al cargar
  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (user) {
          setUsuario(user);
          console.log('Usuario autenticado:', user);
          
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
            console.log('Empresa existente encontrada:', empresaExistente);
            
            // Cargar imágenes del carrusel si existen
            const { data: imagenesExistentes } = await supabase
              .from('carrusel_imagenes')
              .select('imagen_url')
              .eq('empresa_id', empresaExistente.id)
              .order('orden');
              
            if (imagenesExistentes) {
              setImagenesCarrusel(imagenesExistentes.map(img => img.imagen_url));
            }

            // Cargar mini bodegas existentes
            const { data: bodegasExistentes } = await supabase
              .from('mini_bodegas')
              .select('*')
              .eq('empresa_id', empresaExistente.id)
              .order('created_at');
              
            if (bodegasExistentes && bodegasExistentes.length > 0) {
              setBodegas(bodegasExistentes.map(b => ({
                id: b.id,
                metraje: b.metraje,
                descripcion: b.descripcion,
                contenido: b.contenido,
                imagen: b.imagen_url,
                direccion: b.direccion
              })));
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
          }
        }
      } catch (error) {
        console.error('Error obteniendo usuario:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerUsuario();
  }, []);

  // Agregar nueva mini bodega
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
        precioMensual: "" // ✅ Incluir precio
      }
    ]);
  };

  // Eliminar una card
  const handleEliminarBodega = (idx) => {
    setBodegas(bodegas.filter((_, i) => i !== idx));
  };

  // Actualizar una bodega
  const handleUpdateBodega = (idx, field, value) => {
    const nuevas = bodegas.map((b, i) =>
      i === idx ? { ...b, [field]: value } : b
    );
    setBodegas(nuevas);
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

  // 🚀 FUNCIÓN PRINCIPAL ACTUALIZADA: Guardar todo incluyendo descripción
  const handleGuardarTodo = async () => {
    setGuardandoTodo(true);
    
    try {
      console.log('🚀 Iniciando guardado completo...');
      
      // ✅ VALIDACIONES (actualizadas)
      if (!empresa.trim()) {
        alert('❌ Por favor ingresa el nombre de la empresa');
        return;
      }

      if (!imagenesCarrusel || imagenesCarrusel.length === 0) {
        alert('❌ Por favor agrega al menos una imagen del carrusel');
        return;
      }

      const bodegasValidas = bodegas.filter(b => 
        b.metraje && 
        b.descripcion && 
        b.contenido && 
        b.direccion && 
        b.ciudad && 
        b.zona && 
        b.precioMensual // ✅ Validar precio también
      );

      if (bodegasValidas.length === 0) {
        alert('❌ Por favor completa al menos una mini bodega');
        return;
      }

      // 🏢 PASO 1: Guardar/Actualizar empresa
      console.log('📝 Guardando empresa...');
      let empresaData;
      
      if (empresaId) {
        // Actualizar empresa existente
        const { data, error } = await supabase
          .from('empresas')
          .update({ 
            nombre: empresa.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', empresaId)
          .select();
        
        if (error) throw error;
        empresaData = data[0];
      } else {
        // Crear nueva empresa
        const { data, error } = await supabase
          .from('empresas')
          .insert([{
            nombre: empresa.trim(),
            user_id: usuario.id,
            ciudad: 'Bogotá'
          }])
          .select();
        
        if (error) throw error;
        empresaData = data[0];
        setEmpresaId(empresaData.id);
      }

      console.log('✅ Empresa guardada:', empresaData);

      // 🖼️ PASO 2: Subir y guardar imágenes del carrusel
      console.log('📸 Subiendo imágenes del carrusel...');
      
      const urlsCarrusel = await uploadCarruselImages(imagenesCarrusel);
      
      // Limpiar carrusel existente
      await supabase
        .from('carrusel_imagenes')
        .delete()
        .eq('empresa_id', empresaData.id);

      // Insertar nuevas imágenes del carrusel
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

        if (carruselError) throw carruselError;
      }

      console.log('✅ Carrusel guardado');

      // 📝 PASO 3: Guardar descripción de empresa
      console.log('📝 Guardando descripción de empresa...');
      
      // Subir imágenes de descripción
      const urlsDescripcion = await uploadDescripcionImages(imagenesDescripcion);
      
      // Convertir características a array
      const caracteristicasArray = caracteristicas 
        ? caracteristicas.split(',').map(c => c.trim()).filter(c => c.length > 0)
        : [];

      // Verificar si ya existe descripción
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
        // Actualizar descripción existente
        const { error: descError } = await supabase
          .from('empresa_descripcion')
          .update(descripcionData)
          .eq('empresa_id', empresaData.id);

        if (descError) throw descError;
      } else {
        // Crear nueva descripción
        const { error: descError } = await supabase
          .from('empresa_descripcion')
          .insert([descripcionData]);

        if (descError) throw descError;
      }

      console.log('✅ Descripción guardada');

      // 📦 PASO 4: Guardar mini bodegas
      console.log('📦 Guardando mini bodegas...');
      
      // Limpiar mini bodegas existentes
      await supabase
        .from('mini_bodegas')
        .delete()
        .eq('empresa_id', empresaData.id);

      // Subir imágenes y guardar cada mini bodega
      const bodegasGuardadas = [];
      for (let i = 0; i < bodegasValidas.length; i++) {
        const bodega = bodegasValidas[i];
        
        console.log(`Procesando mini bodega ${i + 1}...`);
        
        // Subir imagen si no es una URL
        let imagenUrl = null;
        if (bodega.imagen) {
          if (typeof bodega.imagen === 'string') {
            imagenUrl = bodega.imagen;
          } else {
            imagenUrl = await uploadImage(bodega.imagen);
          }
        }

        // Guardar mini bodega
        const bodegaData = {
          empresa_id: empresaData.id,
          metraje: bodega.metraje.trim(),
          descripcion: bodega.descripcion.trim(),
          contenido: bodega.contenido.trim(),
          direccion: bodega.direccion.trim(),
          ciudad: bodega.ciudad.trim(),
          zona: bodega.zona,
          precio_mensual: parseFloat(bodega.precioMensual), // ✅ Convertir a número
          imagen_url: imagenUrl,
          disponible: true,
          orden: i
        };

        const { data: bodegaInsertada, error: bodegaError } = await supabase
          .from('mini_bodegas')
          .insert([bodegaData])
          .select();

        if (bodegaError) throw bodegaError;
        
        // Agregar la bodega guardada con su ID
        bodegasGuardadas.push(bodegaInsertada[0]);
      }

      console.log('✅ Mini bodegas guardadas');

      // 🔄 PASO 5: RECARGAR DATOS DESDE LA BASE DE DATOS
      console.log('🔄 Recargando datos actualizados desde la BD...');
      
      // Recargar empresa
      const { data: empresaActualizada } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', empresaData.id)
        .single();
      
      if (empresaActualizada) {
        setEmpresa(empresaActualizada.nombre);
        setPerfilCompleto(true);
      }

      // Recargar carrusel
      const { data: carruselActualizado } = await supabase
        .from('carrusel_imagenes')
        .select('imagen_url')
        .eq('empresa_id', empresaData.id)
        .order('orden');
      
      if (carruselActualizado) {
        setImagenesCarrusel(carruselActualizado.map(img => img.imagen_url));
      }

      // Recargar descripción
      const { data: descripcionActualizada } = await supabase
        .from('empresa_descripcion')
        .select('*')
        .eq('empresa_id', empresaData.id)
        .single();
      
      if (descripcionActualizada) {
        setDireccionGeneral(descripcionActualizada.direccion_general || "");
        setDescripcionGeneral(descripcionActualizada.descripcion_general || "");
        setCaracteristicas(descripcionActualizada.caracteristicas?.join(', ') || "");
        setImagenesDescripcion(descripcionActualizada.imagenes_urls || []);
      }

      // Recargar mini bodegas
      const { data: bodegasActualizadas } = await supabase
        .from('mini_bodegas')
        .select('*')
        .eq('empresa_id', empresaData.id)
        .order('orden');
      
      if (bodegasActualizadas) {
        setBodegas(bodegasActualizadas.map(b => ({
          id: b.id,
          metraje: b.metraje,
          descripcion: b.descripcion,
          contenido: b.contenido,
          imagen: b.imagen_url,
          direccion: b.direccion,
          ciudad: b.ciudad,
          zona: b.zona,
          precioMensual: b.precio_mensual?.toString() || ""
        })));
      }

      console.log('✅ Datos recargados exitosamente');

      // 🎉 ÉXITO
      setGuardadoExitoso(true);
      
      alert(`🎉 ¡Perfil guardado exitosamente!\n\n✅ Empresa: ${empresaData.nombre}\n✅ Carrusel: ${urlsCarrusel.length} imágenes\n✅ Descripción: ${descripcionGeneral ? 'Guardada' : 'Sin descripción'}\n✅ Mini bodegas: ${bodegasGuardadas.length}\n\n🔄 Los datos han sido recargados desde la base de datos.`);
      
      // Resetear estado después de 5 segundos
      setTimeout(() => setGuardadoExitoso(false), 5000);

    } catch (error) {
      console.error('❌ Error guardando perfil completo:', error);
      alert(`❌ Error al guardar: ${error.message}`);
    } finally {
      setGuardandoTodo(false);
    }
  };

  // Función recargarDatos actualizada
  const recargarDatos = async () => {
    if (!empresaId) return;
    
    setCargando(true);
    try {
      console.log('🔄 Recargando datos del perfil...');
      
      // Recargar empresa
      const { data: empresaActualizada } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', empresaId)
        .single();
      
      if (empresaActualizada) {
        setEmpresa(empresaActualizada.nombre);
      }

      // Recargar carrusel
      const { data: carruselActualizado } = await supabase
        .from('carrusel_imagenes')
        .select('imagen_url')
        .eq('empresa_id', empresaId)
        .order('orden');
      
      if (carruselActualizado) {
        setImagenesCarrusel(carruselActualizado.map(img => img.imagen_url));
      }

      // Recargar mini bodegas
      const { data: bodegasActualizadas } = await supabase
        .from('mini_bodegas')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('orden');
      
      if (bodegasActualizadas && bodegasActualizadas.length > 0) {
        setBodegas(bodegasActualizadas.map(b => ({
          id: b.id,
          metraje: b.metraje,
          descripcion: b.descripcion,
          contenido: b.contenido,
          imagen: b.imagen_url,
          direccion: b.direccion,
          ciudad: b.ciudad,
          zona: b.zona,
          precioMensual: b.precio_mensual?.toString() || ""
        })));
      } else {
        // Si no hay bodegas, mostrar plantilla inicial
        setBodegas([
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
        setCaracteristicas(descripcionActualizada.caracteristicas?.join(', ') || "");
        setImagenesDescripcion(descripcionActualizada.imagenes_urls || []);
      }

      console.log('✅ Datos recargados exitosamente');
      
    } catch (error) {
      console.error('❌ Error recargando datos:', error);
    } finally {
      setCargando(false);
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header con info del usuario */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#2C3A61] mb-2">
            👋 Bienvenido, {usuario.email}
          </h1>
          <p className="text-gray-600">
            {perfilCompleto ? 'Edita tu perfil de proveedor' : 'Completa tu perfil de proveedor de mini bodegas'}
          </p>
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
                  id={bodega.id}
                  metraje={bodega.metraje}
                  descripcion={bodega.descripcion}
                  contenido={bodega.contenido}
                  imagen={bodega.imagen}
                  direccion={bodega.direccion}
                  ciudad={bodega.ciudad}
                  zona={bodega.zona}
                  precioMensual={bodega.precioMensual} // ✅ Asegurar que se pasa
                  hideGuardarButton={true} // ✅ Ocultar botón individual
                  onImagenChange={img => handleUpdateBodega(idx, "imagen", img)}
                  onMetrajeChange={val => handleUpdateBodega(idx, "metraje", val)}
                  onDescripcionChange={val => handleUpdateBodega(idx, "descripcion", val)}
                  onContenidoChange={val => handleUpdateBodega(idx, "contenido", val)}
                  onDireccionChange={val => handleUpdateBodega(idx, "direccion", val)}
                  onCiudadChange={val => handleUpdateBodega(idx, "ciudad", val)}
                  onZonaChange={val => handleUpdateBodega(idx, "zona", val)}
                  onPrecioMensualChange={val => handleUpdateBodega(idx, "precioMensual", val)} // ✅ Handler para precio
                />
                <button
                  className="mt-4 bg-red-100 hover:bg-red-200 rounded-full p-2 transition-colors"
                  onClick={() => handleEliminarBodega(idx)}
                  title="Eliminar mini bodega"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </button>
              </div>
            ))}
            
            {/* Botón agregar */}
            <div className="flex flex-col items-center w-full max-w-sm">
              <AgregarMiniBodegaBtn onClick={handleAgregarBodega} />
            </div>
          </div>
        </div>
        
        {/* 🚀 BOTÓN PRINCIPAL: Guardar Todo */}
        <div className="flex justify-center mt-8">
          <button
            className={`font-bold px-8 py-3 rounded-xl shadow transition text-lg flex items-center justify-center min-w-[300px] ${
              guardadoExitoso
                ? 'bg-green-500 text-white'
                : 'bg-[#2C3A61] text-white hover:bg-[#4B799B]'
            }`}
            onClick={handleGuardarTodo}
            disabled={guardandoTodo}
          >
            {guardandoTodo ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-3" />
                Guardando todo...
              </>
            ) : guardadoExitoso ? (
              <>
                <Save className="h-5 w-5 mr-3" />
                ¡Guardado Exitosamente! ✅
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-3" />
                {perfilCompleto ? 'Actualizar Perfil' : 'Guardar Todo'}
              </>
            )}
          </button>
        </div>

        {/* Mensaje de estado */}
        {guardadoExitoso && (
          <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg text-center max-w-2xl mx-auto">
            <p className="text-green-700 font-medium">
              🎉 ¡Tu perfil de proveedor ha sido guardado exitosamente!
            </p>
            <p className="text-green-600 text-sm mt-2">
              Todos los datos han sido sincronizados con la base de datos.
            </p>
          </div>
        )}

        {/* Botón de recarga manual (opcional) */}
        {perfilCompleto && (
          <div className="text-center mb-4">
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
              Recargar datos desde la base de datos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
