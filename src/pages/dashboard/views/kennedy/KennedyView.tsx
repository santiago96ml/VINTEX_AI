// src/pages/dashboard/views/kennedy/KennedyView.tsx
import { useState, useEffect } from 'react';
import { Search, Filter, Plus, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

// Tipos basados en tu DB SQL
interface Student {
  id: number;
  full_name: string;
  dni: string;
  career_interest: string;
  status: 'Sólo preguntó' | 'Está interesado' | 'Está indeciso' | 'Inscripto' | 'Graduado';
  location: 'Catamarca' | 'San Nicolás';
  contact_phone: string;
  last_interaction_at: string;
}

const API_URL = import.meta.env.VITE_KENNEDY_API_URL || 'http://localhost:4001/api';

export default function KennedyView() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');

  // Cargar datos del Backend Satélite
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Asumiendo que guardas el JWT aquí
      
      const params = new URLSearchParams({
        search: searchTerm,
        location: selectedLocation,
        status: selectedStatus,
        page: '1'
      });

      const response = await fetch(`${API_URL}/students?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al cargar alumnos');
      
      const data = await response.json();
      setStudents(data.data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor de Kennedy.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Recargar cuando cambian los filtros (Debounce manual simple)
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchStudents();
    }, 500); // Esperar 500ms a que termine de escribir
    return () => clearTimeout(timer);
  }, [searchTerm, selectedLocation, selectedStatus]);

  // Función auxiliar para colores de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Inscripto': return 'bg-green-100 text-green-800 border-green-200';
      case 'Está interesado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sólo preguntó': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Deudor': return 'bg-red-100 text-red-800 border-red-200'; // Aunque ya no usamos lógica de deuda, por si acaso
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="p-6 space-y-6 h-full flex flex-col bg-slate-50/50">
      
      {/* Header con Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Total Alumnos</p>
                  <p className="text-2xl font-bold text-gray-800">{students.length}</p>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
          </div>
      </div>

      {/* Barra de Herramientas */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center justify-between">
        
        {/* Buscador */}
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Buscar por nombre o DNI..." 
            className="pl-10 border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            
            {/* Selector de Sede (Florencia/Rita) */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-500"/>
                        <SelectValue placeholder="Sede" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Todas">Todas las Sedes</SelectItem>
                    <SelectItem value="Catamarca">Catamarca</SelectItem>
                    <SelectItem value="San Nicolás">San Nicolás</SelectItem>
                </SelectContent>
            </Select>

            {/* Selector de Estado */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-500"/>
                        <SelectValue placeholder="Estado" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Todos">Todos los Estados</SelectItem>
                    <SelectItem value="Sólo preguntó">Sólo preguntó</SelectItem>
                    <SelectItem value="Está interesado">Está interesado</SelectItem>
                    <SelectItem value="Inscripto">Inscripto</SelectItem>
                </SelectContent>
            </Select>

            <Button className="bg-slate-900 text-white hover:bg-slate-800">
                <Plus size={16} className="mr-2" />
                Nuevo Alumno
            </Button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Alumno</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">DNI</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Carrera</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Sede</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-400">Cargando datos...</td></tr>
                    ) : students.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-400">No se encontraron alumnos con ese criterio.</td></tr>
                    ) : (
                        students.map((student) => (
                            <tr key={student.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold mr-3">
                                            {student.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{student.full_name}</div>
                                            <div className="text-xs text-gray-500">{student.contact_phone}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{student.dni || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{student.career_interest}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={12} /> {student.location}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(student.status)}`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                                        Ver Ficha
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}