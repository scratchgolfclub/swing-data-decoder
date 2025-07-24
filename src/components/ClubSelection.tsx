import { Plus } from "lucide-react";

interface ClubSelectionProps {
  selectedClub: string;
  onClubSelect: (club: string) => void;
}

export const ClubSelection = ({ selectedClub, onClubSelect }: ClubSelectionProps) => {
  const clubs = [
    { type: 'Driver', items: ['Dr'] },
    { type: 'Woods', items: ['2w', '3w', '4w', '5w', '6w', '7w', '8w', '9w'] },
    { type: 'Hybrids', items: ['1h', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h'] },
    { type: 'Irons', items: ['1i', '2i', '3i', '4i', '5i', '6i', '7i', '8i', '9i'] },
    { type: 'Wedges', items: ['Pw', 'Sw', 'Lw'] },
    { type: 'Degree Wedges', items: ['50°', '52°', '54°', '56°', '58°', '60°'] }
  ];

  const allClubs = clubs.flatMap(category => category.items);

  return (
    <div className="space-y-6">
      {!selectedClub ? (
        <div className="relative">
          <select 
            onChange={(e) => onClubSelect(e.target.value)}
            className="w-full h-16 rounded-2xl border-2 border-border bg-card hover:bg-accent/50 transition-all duration-300 appearance-none px-6 text-lg font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-center"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%23888'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1.5rem center',
              backgroundSize: '20px 20px'
            }}
          >
            <option value="" disabled selected hidden>Choose your club</option>
            {allClubs.map((club) => (
              <option key={club} value={club} className="text-foreground bg-background">
                {club}
              </option>
            ))}
          </select>
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 hover:from-primary/5 hover:to-primary/5 transition-all duration-300"></div>
        </div>
      ) : (
        <div className="flex justify-center animate-scale-in">
          <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-600 text-primary-foreground flex items-center justify-center text-xl font-bold shadow-glow">
              {selectedClub}
            </div>
            <div className="text-left">
              <div className="text-lg font-semibold text-foreground">Club Selected</div>
              <button 
                onClick={() => onClubSelect('')}
                className="text-sm text-primary hover:text-primary-600 underline transition-colors"
              >
                Change Club
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};