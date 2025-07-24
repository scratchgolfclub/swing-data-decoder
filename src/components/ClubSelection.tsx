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
      
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 max-w-4xl mx-auto">
        {allClubs.map((club) => (
          <button
            key={club}
            onClick={() => onClubSelect(club)}
            className={`w-12 h-12 rounded-full border-2 transition-all ${
              selectedClub === club 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-card hover:bg-muted border-border flex items-center justify-center'
            }`}
          >
            {selectedClub === club ? (
              <span className={`text-xs font-medium ${club.includes('°') ? 'text-xs' : 'text-sm'}`}>
                {club}
              </span>
            ) : (
              <Plus className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};