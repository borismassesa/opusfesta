import { MapPin, Clock } from 'lucide-react';

interface Event {
  id: string;
  time: string;
  title: string;
  location: string;
  description: string;
}

export default function Schedule() {
  const events: Event[] = [
    {
      id: '1',
      time: '10:00 AM',
      title: 'Church Ceremony',
      location: 'St. Peter\'s Parish, Oysterbay',
      description: 'Join us as we exchange our vows and become husband and wife in a traditional church ceremony.',
    },
    {
      id: '2',
      time: '12:30 PM',
      title: 'Send-off Lunch',
      location: 'Mlimani City Hall',
      description: 'A light lunch will be served as family and friends gather to celebrate the bride\'s send-off.',
    },
    {
      id: '3',
      time: '04:00 PM',
      title: 'Couple Photoshoot',
      location: 'Botanical Gardens',
      description: 'The wedding party will step away for photos. Guests are welcome to head to the reception venue for welcome drinks.',
    },
    {
      id: '4',
      time: '06:30 PM',
      title: 'Evening Reception',
      location: 'Serena Hotel, Dar es Salaam',
      description: 'Dinner, speeches, and our first dance as a married couple. Let the celebrations begin!',
    },
    {
      id: '5',
      time: '09:00 PM',
      title: 'After Party & Dancing',
      location: 'Serena Hotel, Dar es Salaam',
      description: 'Bring your dancing shoes! We\'ll be celebrating on the dance floor until the early hours.',
    },
  ];

  return (
    <div className="max-w-container-max mx-auto px-margin-page pb-20">
      <div className="mb-20 text-center max-w-2xl mx-auto">
        <h2 className="font-display-md text-4xl lg:text-5xl mb-6">Wedding Schedule</h2>
        <p className="text-secondary text-sm lg:text-base leading-relaxed font-light italic font-display-md">
          We can't wait to celebrate with you. Here is what to expect on our special day.
        </p>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Vertical Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-outline-variant/30 transform md:-translate-x-1/2"></div>
        
        <div className="space-y-12">
          {events.map((event, index) => {
            const isLeft = index % 2 === 0;
            return (
            <div key={event.id} className="relative flex flex-col md:grid md:grid-cols-2 md:gap-16 items-center">
              
              {/* Dot */}
              <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary rounded-full transform -translate-x-1/2 md:-translate-y-1/2 mt-8 md:mt-0 ring-4 ring-white top-0 md:top-1/2 z-20"></div>
              
              {/* Content */}
              <div className={`pl-12 md:pl-0 w-full ${isLeft ? 'md:col-start-1 md:pr-12' : 'md:col-start-2 md:pl-12'}`}>
                <div className={`p-6 md:p-8 bg-white rounded-2xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow relative flex flex-col items-start text-left z-10`}>
                  
                  {/* Animated Dashed Line (Desktop) */}
                  <svg className={`hidden md:block absolute top-1/2 w-20 h-[2px] -translate-y-1/2 -z-10 ${isLeft ? 'right-[-5rem]' : 'left-[-5rem]'}`}>
                    <line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-primary/40 animate-dash" />
                  </svg>

                  {/* Animated Dashed Line (Mobile) */}
                  <svg className="md:hidden absolute left-[-2rem] top-10 w-8 h-[2px] -z-10">
                    <line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-primary/40 animate-dash" />
                  </svg>

                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </div>
                  
                  <h3 className="font-display-md text-2xl mb-3">{event.title}</h3>
                  
                  <div className={`flex items-center gap-2 text-secondary/80 text-xs uppercase tracking-widest font-bold mb-4`}>
                    <MapPin className="w-4 h-4 text-accent shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  
                  <p className="text-secondary text-sm font-light leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
