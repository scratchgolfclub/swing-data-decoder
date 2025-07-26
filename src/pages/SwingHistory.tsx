import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Search, Filter, Eye, Target, TrendingUp, SortAsc, SortDesc } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { getStructuredMetrics, getMetricDisplay, type StructuredMetric } from '@/utils/structuredMetricsHelper';

interface SwingData {
  id: string;
  session_name: string;
  club_type: string;
  created_at: string;
  trackman_image_url: string;
  // Individual metric columns
  club_speed?: number;
  ball_speed?: number;
  carry?: number;
  total?: number;
  side?: string;
  face_angle?: number;
  club_path?: number;
  smash_factor?: number;
  spin_rate?: number;
  launch_angle?: number;
}

type SortField = 'created_at' | 'swing_score' | 'session_name' | 'club_type';
type SortOrder = 'asc' | 'desc';

const SwingHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [swingData, setSwingData] = useState<SwingData[]>([]);
  const [filteredData, setFilteredData] = useState<SwingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clubFilter, setClubFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    if (user) {
      loadSwingData();
    }
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [swingData, searchTerm, clubFilter, scoreFilter, sortField, sortOrder]);

  const loadSwingData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('swings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSwingData(data || []);
    } catch (error) {
      console.error('Error loading swing data:', error);
      toast({
        title: "Error",
        description: "Failed to load swing history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...swingData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(swing =>
        swing.session_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        swing.club_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Club type filter
    if (clubFilter !== 'all') {
      filtered = filtered.filter(swing => swing.club_type === clubFilter);
    }

    // Score filter - remove since we don't have swing_score anymore
    // Instead, we could filter by distance ranges or other metrics if needed

    // Sort
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortField) {
        case 'created_at':
          valueA = new Date(a.created_at).getTime();
          valueB = new Date(b.created_at).getTime();
          break;
        case 'swing_score':
          valueA = a.total || 0;  // Use total distance as a score proxy
          valueB = b.total || 0;
          break;
        case 'session_name':
          valueA = a.session_name.toLowerCase();
          valueB = b.session_name.toLowerCase();
          break;
        case 'club_type':
          valueA = a.club_type.toLowerCase();
          valueB = b.club_type.toLowerCase();
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredData(filtered);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getUniqueClubTypes = () => {
    const clubs = Array.from(new Set(swingData.map(swing => swing.club_type)));
    return clubs.sort();
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Swing History
          </h1>
          <p className="text-muted-foreground">
            Complete history of all your analyzed swings ({swingData.length} total)
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sessions, clubs, notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Club Type</label>
                <Select value={clubFilter} onValueChange={setClubFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All clubs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clubs</SelectItem>
                    {getUniqueClubTypes().map(club => (
                      <SelectItem key={club} value={club}>{club}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Score Range</label>
                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All scores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scores</SelectItem>
                    <SelectItem value="90+">90+ (Excellent)</SelectItem>
                    <SelectItem value="80-89">80-89 (Good)</SelectItem>
                    <SelectItem value="70-79">70-79 (Average)</SelectItem>
                    <SelectItem value="0-69">Below 70 (Needs Work)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Results</label>
                <p className="text-2xl font-bold text-primary">{filteredData.length}</p>
                <p className="text-sm text-muted-foreground">
                  of {swingData.length} swings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardContent className="p-0">
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No swings found</h3>
                <p className="text-muted-foreground">
                  {swingData.length === 0 
                    ? "Upload your first TrackMan screenshot to get started"
                    : "Try adjusting your filters"
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        Date <SortIcon field="created_at" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('session_name')}
                    >
                      <div className="flex items-center gap-2">
                        Session <SortIcon field="session_name" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('club_type')}
                    >
                      <div className="flex items-center gap-2">
                        Club <SortIcon field="club_type" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('swing_score')}
                    >
                      <div className="flex items-center gap-2">
                        Score <SortIcon field="swing_score" />
                      </div>
                    </TableHead>
                    <TableHead>Key Metrics</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((swing) => (
                    <TableRow key={swing.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {new Date(swing.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(swing.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{swing.session_name}</p>
                          {/* Baseline badge removed since is_baseline column no longer exists */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{swing.club_type}</Badge>
                      </TableCell>
                       <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{swing.total || '--'}</span>
                          <span className="text-muted-foreground">yds</span>
                        </div>
                      </TableCell>
                       <TableCell>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {swing.club_speed && (
                            <div>
                              <p className="text-muted-foreground">Club Speed</p>
                              <p className="font-medium">{swing.club_speed} mph</p>
                            </div>
                          )}
                          {swing.carry && (
                            <div>
                              <p className="text-muted-foreground">Carry</p>
                              <p className="font-medium">{swing.carry} yds</p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/swing/${swing.id}`)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SwingHistory;