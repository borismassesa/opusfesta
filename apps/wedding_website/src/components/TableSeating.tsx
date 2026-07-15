import React, { useState } from 'react';
import { Users, GripVertical } from 'lucide-react';

interface Guest {
  id: string;
  name: string;
  tableId: string | null;
  group?: string;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
}

export default function TableSeating() {
  const [guests, setGuests] = useState<Guest[]>([
    { id: '1', name: 'Amina (Bride)', tableId: '1', group: 'Wedding Party' },
    { id: '2', name: 'Juma (Groom)', tableId: '1', group: 'Wedding Party' },
    { id: '3', name: 'Best Man', tableId: '1', group: 'Wedding Party' },
    { id: '4', name: 'Maid of Honor', tableId: '1', group: 'Wedding Party' },
    { id: '5', name: 'Baba Juma', tableId: '2', group: 'Family' },
    { id: '6', name: 'Mama Juma', tableId: '2', group: 'Family' },
    { id: '7', name: 'Uncle Ali', tableId: '2', group: 'Family' },
    { id: '8', name: 'Auntie Fatima', tableId: '2', group: 'Family' },
    { id: '9', name: 'Sarah', tableId: null, group: 'Friends' },
    { id: '10', name: 'Kelvin', tableId: null, group: 'Friends' },
    { id: '11', name: 'John Doe', tableId: null, group: 'Colleagues' },
    { id: '12', name: 'Mary Smith', tableId: null, group: 'Colleagues' },
    { id: '13', name: 'David', tableId: null, group: 'Friends' },
    { id: '14', name: 'Grace', tableId: null, group: 'Friends' },
    { id: '15', name: 'Michael', tableId: null, group: 'Colleagues' },
  ]);

  const tables: Table[] = [
    { id: '1', name: 'Head Table', capacity: 4 },
    { id: '2', name: 'Table 1 (Family)', capacity: 8 },
    { id: '3', name: 'Table 2 (Friends)', capacity: 8 },
    { id: '4', name: 'Table 3 (Colleagues)', capacity: 8 },
  ];

  const handleDragStart = (e: React.DragEvent, guestId: string) => {
    e.dataTransfer.setData('guestId', guestId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, tableId: string | null) => {
    e.preventDefault();
    const guestId = e.dataTransfer.getData('guestId');
    
    setGuests(prevGuests => prevGuests.map(guest => {
      if (guest.id === guestId) {
        if (tableId !== null) {
          const table = tables.find(t => t.id === tableId);
          const currentGuests = prevGuests.filter(g => g.tableId === tableId).length;
          if (table && currentGuests >= table.capacity && guest.tableId !== tableId) {
            // Optional: you could show a toast here instead of an alert
            return guest;
          }
        }
        return { ...guest, tableId };
      }
      return guest;
    }));
  };

  const unassignedGuests = guests.filter(g => g.tableId === null);

  return (
    <div className="max-w-container-max mx-auto px-margin-page pb-20">
      <div className="mb-16 text-center max-w-2xl mx-auto">
        <h2 className="font-display-md text-4xl lg:text-5xl mb-6">Table & Seating</h2>
        <p className="text-secondary text-sm lg:text-base leading-relaxed font-light italic font-display-md">
          Arrange the seating for your guests. Drag and drop guests from the unassigned list to a table.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Unassigned Guests Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
          <div 
            className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/20 flex flex-col h-[600px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, null)}
          >
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-outline-variant/30">
              <div>
                <h3 className="font-display-md text-2xl">Unassigned Guests</h3>
                <p className="text-secondary/70 text-xs mt-1 uppercase tracking-widest font-bold">
                  {unassignedGuests.length} Guests remaining
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                <Users className="w-5 h-5" />
              </div>
            </div>
            
            <div className="overflow-y-auto pr-2 -mr-2 space-y-3 flex-1 custom-scrollbar">
              {unassignedGuests.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-secondary/50 p-6 text-center border-2 border-dashed border-outline-variant/30 rounded-xl">
                  <p className="text-sm">All guests have been assigned to a table!</p>
                </div>
              ) : (
                unassignedGuests.map(guest => (
                  <div
                    key={guest.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, guest.id)}
                    className="flex items-center gap-3 p-4 bg-surface-container rounded-xl cursor-grab active:cursor-grabbing hover:bg-outline-variant/20 transition-colors border border-transparent hover:border-outline-variant/30 group"
                  >
                    <GripVertical className="w-4 h-4 text-secondary/30 group-hover:text-secondary/60" />
                    <div>
                      <p className="text-sm font-bold text-on-surface">{guest.name}</p>
                      {guest.group && (
                        <span className="text-[10px] text-secondary/70 uppercase tracking-wider">{guest.group}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tables.map(table => {
              const tableGuests = guests.filter(g => g.tableId === table.id);
              const isFull = tableGuests.length >= table.capacity;
              
              return (
                <div
                  key={table.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, table.id)}
                  className={`bg-white rounded-3xl p-6 shadow-sm border transition-all duration-300 min-h-[300px] flex flex-col
                    ${isFull ? 'border-outline-variant/20 bg-surface-container/50' : 'border-primary/20 hover:border-primary/40 hover:shadow-md'}
                  `}
                >
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
                    <h4 className="font-display-md text-xl">{table.name}</h4>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isFull ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                      {tableGuests.length} / {table.capacity} Seats
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    {tableGuests.length === 0 ? (
                      <div className="h-full min-h-[150px] flex items-center justify-center text-secondary/40 text-sm border-2 border-dashed border-outline-variant/20 rounded-xl bg-surface-container/50">
                        Drag guests here
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {tableGuests.map(guest => (
                          <div
                            key={guest.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, guest.id)}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-grab active:cursor-grabbing border border-outline-variant/30 hover:border-primary/30 hover:shadow-sm transition-all group"
                          >
                            <GripVertical className="w-4 h-4 text-secondary/30 group-hover:text-primary/50" />
                            <div>
                              <p className="text-sm font-bold">{guest.name}</p>
                              {guest.group && (
                                <span className="text-[10px] text-secondary/60 uppercase tracking-wider">{guest.group}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Empty Seats Visual Representation */}
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    {Array.from({ length: table.capacity }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-6 h-6 rounded-full border-2 ${i < tableGuests.length ? 'bg-primary border-primary' : 'bg-transparent border-outline-variant/40'}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}
