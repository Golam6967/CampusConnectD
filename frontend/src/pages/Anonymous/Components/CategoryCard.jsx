// src/components/CategoryCard.jsx
import { useNavigate } from "react-router-dom";

export default function CategoryCard({ category }) {
    const navigate = useNavigate();

    return (
        <div 
            onClick={() => navigate(`/category/${encodeURIComponent(category)}`)}
            className="
                group relative overflow-hidden
                flex items-center justify-center
                bg-white border-2 border-gray-200 
                p-8 rounded-2xl min-h-[140px]
                cursor-pointer text-center font-bold text-gray-800 uppercase tracking-tight
                transition-all duration-300 ease-in-out
                hover:border-red-600 hover:text-red-600
                hover:shadow-2xl hover:shadow-red-100 
                hover:-translate-y-2 active:scale-95
            "
        >
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-red-100/0 group-hover:from-red-50/50 group-hover:to-red-100/30 transition-all duration-300"></div>
            <span className="relative z-10 text-lg">{category}</span>
        </div>
    );
}