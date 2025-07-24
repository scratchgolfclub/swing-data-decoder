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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
          1
        </div>
        <h3 className="text-lg font-semibold">Select Your Club</h3>
      </div>
      
      {!selectedClub ? (
        <div className="flex justify-center">
          <select 
            onChange={(e) => onClubSelect(e.target.value)}
            className="w-12 h-12 rounded-full border-2 border-border bg-card hover:bg-muted transition-all appearance-none flex items-center justify-center cursor-pointer text-center"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M12 4.5v15m7.5-7.5h-15'/%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: '16px 16px'
            }}
          >
            <option value="" disabled selected hidden></option>
            {allClubs.map((club) => (
              <option key={club} value={club}>
                {club}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {selectedClub}
            </div>
            <button 
              onClick={() => onClubSelect('')}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Change Club
            </button>
          </div>
        </div>
      )}
    </div>
  );
};