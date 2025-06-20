import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGenerateActivityLogs } from '@/hooks/useActivityLogs';

interface GenerateActivityLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GenerateActivityLogsModal: React.FC<GenerateActivityLogsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    date: '',
    frequency: 'DAILY' as 'DAILY' | 'WEEKLY' | 'MONTHLY',
  });

  const {
    mutate: generateActivityLogs,
    isPending: isGenerating
  } = useGenerateActivityLogs();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date) {
      toast.error('Please select a date');
      return;
    }

    generateActivityLogs({
      date: formData.date,
      frequency: formData.frequency,
    }, {
      onSuccess: () => {
        toast.success('Activity logs generated successfully!');
        onSuccess?.();
        onClose();
        // Reset form
        setFormData({
          date: '',
          frequency: 'DAILY',
        });
      },
      onError: (error) => {
        toast.error('Failed to generate activity logs');
        console.error('Generate activity logs error:', error);
      }
    });
  };

  const handleClose = () => {
    if (!isGenerating) {
      onClose();
      // Reset form
      setFormData({
        date: '',
        frequency: 'DAILY',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Generate Activity Logs
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isGenerating}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Frequency
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
              className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              disabled={isGenerating}
            >
              <option value="DAILY">Daily - Generate logs for the selected date</option>
              <option value="WEEKLY">Weekly - Generate logs for weekly activities</option>
              <option value="MONTHLY">Monthly - Generate logs for monthly activities</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              The system will automatically determine which activities to generate based on their configured frequency.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Date
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              disabled={isGenerating}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isGenerating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isGenerating || !formData.date}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Logs'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> This will generate activity logs based on your configured activities 
            for the selected frequency and date. The system will:
          </p>
          <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
            <li>Generate daily activities for the selected date (excluding weekends by default)</li>
            <li>Generate weekly activities if the date is a Sunday</li>
            <li>Generate monthly activities if the date is the 1st of the month</li>
            <li>Skip generation if the date is in your excluded intervals</li>
            <li>Skip generation if logs already exist for the same date</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GenerateActivityLogsModal; 