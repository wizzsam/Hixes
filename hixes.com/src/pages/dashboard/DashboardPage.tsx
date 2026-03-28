import { LayoutDashboard } from "lucide-react";

export const DashboardPage = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[400px]">
                <div className="bg-blue-50 p-4 rounded-full mb-6 ring-4 ring-blue-50/50">
                    <LayoutDashboard className="w-12 h-12 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight text-center">Bienvenido a tu Dashboard</h1>
                <p className="text-slate-500 text-center mt-3 max-w-lg leading-relaxed font-medium">
                    Aquí podrás ver un resumen general de tus actividades, progreso de tus clientes y métricas clave. <br/> <br/> <span className="text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full text-sm">Módulo en construcción</span>
                </p>
            </div>
        </div>
    );
};
