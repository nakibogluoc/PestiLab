import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Scale, Beaker, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export default function WeighingPage({ user }) {
  const [compounds, setCompounds] = useState([]);
  const [selectedCompound, setSelectedCompound] = useState(null);
  const [weighedAmount, setWeighedAmount] = useState('');
  const [weighedUnit, setWeighedUnit] = useState('mg');
  const [preparedVolume, setPreparedVolume] = useState('');
  const [volumeUnit, setVolumeUnit] = useState('mL');
  const [solvent, setSolvent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showLabelDialog, setShowLabelDialog] = useState(false);

  useEffect(() => {
    fetchCompounds();
  }, []);

  const fetchCompounds = async () => {
    try {
      const response = await axios.get(`${API}/compounds`);
      setCompounds(response.data);
    } catch (error) {
      toast.error('Failed to load compounds');
    }
  };

  const handleCompoundSelect = (compoundId) => {
    const compound = compounds.find(c => c.id === compoundId);
    setSelectedCompound(compound);
    setSolvent(compound?.solvent || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompound) {
      toast.error('Please select a compound');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/weighing`, {
        compound_id: selectedCompound.id,
        weighed_amount: parseFloat(weighedAmount),
        weighed_unit: weighedUnit,
        prepared_volume: parseFloat(preparedVolume),
        volume_unit: volumeUnit,
        solvent: solvent
      });

      setResult(response.data);
      setShowLabelDialog(true);
      toast.success('Weighing record created successfully!');
      
      // Reset form
      setWeighedAmount('');
      setPreparedVolume('');
      setSelectedCompound(null);
      setSolvent('');
      
      // Refresh compounds to get updated stock
      fetchCompounds();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create weighing record');
    } finally {
      setLoading(false);
    }
  };

  const canCreate = user?.role !== 'readonly';

  return (
    <div className="p-8" data-testid="weighing-page">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Weighing & Calculation</h1>
          <p className="text-gray-600">Record weighing data and generate labels automatically</p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-green-600" />
              New Weighing Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Compound Selection */}
              <div className="space-y-2">
                <Label>Select Compound</Label>
                <Select 
                  value={selectedCompound?.id || ''} 
                  onValueChange={handleCompoundSelect}
                  disabled={!canCreate}
                >
                  <SelectTrigger data-testid="weighing-compound-select">
                    <SelectValue placeholder="Select a compound..." />
                  </SelectTrigger>
                  <SelectContent>
                    {compounds.map(compound => (
                      <SelectItem key={compound.id} value={compound.id}>
                        {compound.name} ({compound.cas_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCompound && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">CAS Number:</p>
                      <p className="font-mono font-medium">{selectedCompound.cas_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Default Solvent:</p>
                      <p className="font-medium">{selectedCompound.solvent}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Current Stock:</p>
                      <p className="font-semibold">
                        {selectedCompound.stock_value.toFixed(2)} {selectedCompound.stock_unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Critical Level:</p>
                      <p className="text-red-600 font-medium">
                        {selectedCompound.critical_value.toFixed(2)} {selectedCompound.critical_unit}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Weighing Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Weighed Amount</Label>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="e.g. 12.5"
                    value={weighedAmount}
                    onChange={(e) => setWeighedAmount(e.target.value)}
                    required
                    disabled={!canCreate}
                    data-testid="weighing-amount-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={weighedUnit} onValueChange={setWeighedUnit} disabled={!canCreate}>
                    <SelectTrigger data-testid="weighing-amount-unit-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mg">mg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="µg">µg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Prepared Volume */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prepared Volume</Label>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="e.g. 10"
                    value={preparedVolume}
                    onChange={(e) => setPreparedVolume(e.target.value)}
                    required
                    disabled={!canCreate}
                    data-testid="weighing-volume-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={volumeUnit} onValueChange={setVolumeUnit} disabled={!canCreate}>
                    <SelectTrigger data-testid="weighing-volume-unit-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mL">mL</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="µL">µL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Solvent */}
              <div className="space-y-2">
                <Label>Solvent (Optional - defaults to compound's recommended solvent)</Label>
                <Input
                  placeholder="e.g. Acetone"
                  value={solvent}
                  onChange={(e) => setSolvent(e.target.value)}
                  disabled={!canCreate}
                  data-testid="weighing-solvent-input"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg font-semibold"
                disabled={loading || !canCreate}
                data-testid="weighing-submit-button"
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Beaker className="w-5 h-5" />
                    Calculate & Generate Label
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Label Preview Dialog */}
        {result && (
          <Dialog open={showLabelDialog} onOpenChange={setShowLabelDialog}>
            <DialogContent className="max-w-3xl" data-testid="label-dialog">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-green-600" />
                  Label Generated Successfully
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Calculation Results */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3">Calculation Results</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Concentration:</p>
                      <p className="text-xl font-bold text-green-700">
                        {result.usage.concentration.toFixed(3)} {result.usage.concentration_unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Remaining Stock:</p>
                      <p className="text-lg font-semibold">
                        {result.usage.remaining_stock.toFixed(2)} {result.usage.remaining_stock_unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Label Code:</p>
                      <p className="text-lg font-mono font-bold text-blue-600">{result.label.label_code}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Prepared By:</p>
                      <p className="font-medium">{result.usage.prepared_by}</p>
                    </div>
                  </div>
                </div>

                {/* Label Preview */}
                <div className="border-2 border-gray-300 rounded-lg p-6" style={{
                  width: '70mm',
                  height: '25mm',
                  margin: '0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'white'
                }}>
                  <div>
                    <p className="font-bold text-xs uppercase" style={{ fontSize: '8pt' }}>
                      {result.label.compound_name}
                    </p>
                    <p className="text-xs" style={{ fontSize: '6pt' }}>
                      CAS: {result.label.cas_number} • Conc.: {result.label.concentration}
                    </p>
                    <p className="text-xs" style={{ fontSize: '6pt' }}>
                      Date: {result.label.date} • Prepared by: {result.label.prepared_by}
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="font-mono font-bold text-xs" style={{ fontSize: '7pt' }}>
                      Code: {result.label.label_code}
                    </p>
                    <div className="flex gap-2">
                      <img 
                        src={`data:image/png;base64,${result.qr_code}`} 
                        alt="QR Code" 
                        className="w-12 h-12"
                      />
                      <img 
                        src={`data:image/png;base64,${result.barcode}`} 
                        alt="Barcode" 
                        className="h-12"
                        style={{ width: 'auto' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.print()}
                    data-testid="print-label-button"
                  >
                    Print Label
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowLabelDialog(false)}
                    data-testid="close-label-dialog"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}