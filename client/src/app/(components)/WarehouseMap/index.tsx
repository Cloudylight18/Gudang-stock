"use client";

import React from "react";
import { Map as MapIcon, Info } from "lucide-react";

type MapPoint = {
  productId: string;
  name: string;
  mapPosition: {
    x: number | null;
    y: number | null;
  };
};

const WarehouseMap = ({ itemsFound }: { itemsFound: MapPoint[] }) => {
  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-white flex flex-col h-full min-h-[600px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic flex items-center gap-2">
            <MapIcon className="text-red-500" />
            Visual <span className="text-red-500">Locator</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pemetaan Stok Real-Time</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            <span>Target Lokasi</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 w-full bg-slate-100 rounded-[2.5rem] border-8 border-slate-50 overflow-hidden shadow-inner group">
        {/* Denah Gudang Fisik */}
        <img 
          src="/denah-gudang.png" 
          alt="Warehouse Layout"
          className="w-full h-full object-contain opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700" 
          onError={(e) => { (e.target as any).src = "https://placehold.co/800x600?text=Upload+Denah+Gudang+ke+Public+Folder"; }}
        />
        
        {/* Koordinat Dinamis */}
        {itemsFound.map((item) => (
          item.mapPosition?.x !== null && item.mapPosition?.y !== null && (
            <div 
              key={item.productId}
              className="absolute z-20 group/point"
              style={{ 
                left: `${item.mapPosition.x}%`, 
                top: `${item.mapPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Radar Effect */}
              <div className="absolute w-16 h-16 bg-red-500 rounded-full animate-ping opacity-20 -left-5 -top-5"></div>
              
              {/* Point */}
              <div className="relative w-8 h-8 bg-red-600 border-4 border-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer transform hover:scale-125 transition-all">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                
                {/* Floating Label */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-4 py-2 rounded-xl opacity-0 group-hover/point:opacity-100 transition-all whitespace-nowrap shadow-xl pointer-events-none">
                  {item.name}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                </div>
              </div>
            </div>
          )
        ))}

        {/* Info Legend */}
        <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/50 flex items-start gap-3">
          <Info className="text-indigo-500 flex-shrink-0" size={18} />
          <p className="text-[10px] font-bold text-slate-600 leading-relaxed uppercase">
            Gunakan koordinat (X, Y) di dashboard admin untuk menyesuaikan posisi titik kain. 
            Semakin presisi koordinat, semakin akurat navigasi AI.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WarehouseMap;