import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpeedRecords } from '../speed-records';
import { SpeedData, Lane } from '@/types/speed-data';

// Mock data
const mockData: SpeedData[] = [
  {
    id: 1,
    sensor_name: 'Sector 1 Entry',
    speed: 250.5,
    lane: Lane.Left,
    created_at: '2025-12-05T10:00:00Z',
  },
  {
    id: 2,
    sensor_name: 'Sector 2 Entry',
    speed: 180.3,
    lane: Lane.Right,
    created_at: '2025-12-05T10:05:00Z',
  },
  {
    id: 3,
    sensor_name: 'Finish Line',
    speed: 300.8,
    lane: Lane.Left,
    created_at: '2025-12-05T10:10:00Z',
  },
  {
    id: 4,
    sensor_name: 'Pit Entry',
    speed: 120.0,
    lane: Lane.Right,
    created_at: '2025-12-05T10:15:00Z',
  },
];

describe('SpeedRecords', () => {
  describe('Rendering', () => {
    it('renders the component with title', () => {
      render(<SpeedRecords data={mockData} />);
      expect(screen.getByText('Enregistrements de vitesse')).toBeInTheDocument();
    });

    it('displays the correct number of records', () => {
      render(<SpeedRecords data={mockData} />);
      expect(screen.getByText(/4 enregistrements trouvés/i)).toBeInTheDocument();
    });

    it('shows "no data" message when data array is empty', () => {
      render(<SpeedRecords data={[]} />);
      expect(screen.getByText('Aucune donnée disponible')).toBeInTheDocument();
    });

    it('renders all column headers', () => {
      render(<SpeedRecords data={mockData} />);
      expect(screen.getByRole('button', { name: /ID/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Capteur/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Vitesse/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Voie/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Date & Heure/i })).toBeInTheDocument();
    });

    it('renders all filter inputs', () => {
      render(<SpeedRecords data={mockData} />);
      expect(screen.getByPlaceholderText('ID...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Vitesse...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Voie...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Date...')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts by ID in ascending order when clicked once', () => {
      render(<SpeedRecords data={mockData} />);
      const idHeader = screen.getByRole('button', { name: /ID/i });

      fireEvent.click(idHeader);

      const rows = screen.getAllByRole('row');
      // Skip header rows (first 2 rows are headers)
      expect(within(rows[2]).getByText('1')).toBeInTheDocument();
      expect(within(rows[3]).getByText('2')).toBeInTheDocument();
    });

    it('sorts by ID in descending order when clicked twice', () => {
      render(<SpeedRecords data={mockData} />);
      const idHeader = screen.getByRole('button', { name: /ID/i });

      fireEvent.click(idHeader);
      fireEvent.click(idHeader);

      const rows = screen.getAllByRole('row');
      expect(within(rows[2]).getByText('4')).toBeInTheDocument();
      expect(within(rows[3]).getByText('3')).toBeInTheDocument();
    });

    it('sorts by speed correctly', () => {
      render(<SpeedRecords data={mockData} />);
      const speedHeader = screen.getByRole('button', { name: /Vitesse/i });

      fireEvent.click(speedHeader);

      const rows = screen.getAllByRole('row');
      // Lowest speed should be first (120.0)
      expect(within(rows[2]).getByText('120 km/h')).toBeInTheDocument();
    });

    it('sorts by sensor name alphabetically', () => {
      render(<SpeedRecords data={mockData} />);
      const sensorHeader = screen.getByRole('button', { name: /Capteur/i });

      fireEvent.click(sensorHeader);

      const rows = screen.getAllByRole('row');
      expect(within(rows[2]).getByText('Finish Line')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters by ID', async () => {
      const user = userEvent.setup();
      render(<SpeedRecords data={mockData} />);

      const idFilter = screen.getByPlaceholderText('ID...');
      await user.type(idFilter, '1');

      // Should show records with ID containing '1' (1)
      expect(screen.getByText('1 enregistrement trouvé')).toBeInTheDocument();
    });

    it('filters by sensor name', async () => {
      const user = userEvent.setup();
      render(<SpeedRecords data={mockData} />);

      const sensorFilter = screen.getByPlaceholderText('Rechercher...');
      await user.type(sensorFilter, 'Sector');

      // Should show records with 'Sector' in name (2 records)
      expect(screen.getByText('2 enregistrements trouvés')).toBeInTheDocument();
    });

    it('filters by speed', async () => {
      const user = userEvent.setup();
      render(<SpeedRecords data={mockData} />);

      const speedFilter = screen.getByPlaceholderText('Vitesse...');
      await user.type(speedFilter, '250');

      expect(screen.getByText('1 enregistrement trouvé')).toBeInTheDocument();
    });

    it('filters by lane', async () => {
      const user = userEvent.setup();
      render(<SpeedRecords data={mockData} />);

      const laneFilter = screen.getByPlaceholderText('Voie...');
      await user.type(laneFilter, 'left');

      // Should show 2 records from Left lane
      expect(screen.getByText('2 enregistrements trouvés')).toBeInTheDocument();
    });

    it('shows clear filters button when filters are active', async () => {
      const user = userEvent.setup();
      render(<SpeedRecords data={mockData} />);

      const idFilter = screen.getByPlaceholderText('ID...');
      await user.type(idFilter, '1');

      expect(screen.getByRole('button', { name: /Effacer les filtres/i })).toBeInTheDocument();
    });

    it('clears all filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<SpeedRecords data={mockData} />);

      const idFilter = screen.getByPlaceholderText('ID...');
      await user.type(idFilter, '1');

      const clearButton = screen.getByRole('button', { name: /Effacer les filtres/i });
      await user.click(clearButton);

      expect(screen.getByText('4 enregistrements trouvés')).toBeInTheDocument();
      expect(idFilter).toHaveValue('');
    });

    it('shows "no results" message when filter matches nothing', async () => {
      const user = userEvent.setup();
      render(<SpeedRecords data={mockData} />);

      const idFilter = screen.getByPlaceholderText('ID...');
      await user.type(idFilter, '999');

      expect(screen.getByText('Aucun résultat trouvé')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    // Create more than 20 records to test pagination
    const manyRecords: SpeedData[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      sensor_name: `Sensor ${i + 1}`,
      speed: 100 + i,
      lane: i % 2 === 0 ? Lane.Left : Lane.Right,
      created_at: `2025-12-05T${String(10 + Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00Z`,
    }));

    it('shows pagination controls when more than 20 records', () => {
      render(<SpeedRecords data={manyRecords} />);

      expect(screen.getByText(/Page 1 sur 3/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Précédent/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Suivant/i })).toBeInTheDocument();
    });

    it('disables previous button on first page', () => {
      render(<SpeedRecords data={manyRecords} />);

      const prevButton = screen.getByRole('button', { name: /Précédent/i });
      expect(prevButton).toBeDisabled();
    });

    it('navigates to next page when next button is clicked', async () => {
      const user = userEvent.setup();
      render(<SpeedRecords data={manyRecords} />);

      const nextButton = screen.getByRole('button', { name: /Suivant/i });
      await user.click(nextButton);

      expect(screen.getByText(/Page 2 sur 3/i)).toBeInTheDocument();
    });

    it('disables next button on last page', async () => {
      const user = userEvent.setup();
      render(<SpeedRecords data={manyRecords} />);

      const nextButton = screen.getByRole('button', { name: /Suivant/i });

      // Navigate to last page
      await user.click(nextButton);
      await user.click(nextButton);

      expect(nextButton).toBeDisabled();
      expect(screen.getByText(/Page 3 sur 3/i)).toBeInTheDocument();
    });

    it('shows single page info when 20 or fewer records', () => {
      render(<SpeedRecords data={mockData} />);

      // Should show "Page 1 sur 1" since there's only one page
      expect(screen.getByText(/Page 1 sur 1/i)).toBeInTheDocument();

      // Previous and Next buttons should be disabled on single page
      const prevButton = screen.getByRole('button', { name: /Précédent/i });
      const nextButton = screen.getByRole('button', { name: /Suivant/i });
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Column Resizing', () => {
    it('allows column resizing via mouse drag', () => {
      render(<SpeedRecords data={mockData} />);

      // Find a resize handle (they have cursor-col-resize class)
      const resizeHandles = document.querySelectorAll('.cursor-col-resize');
      expect(resizeHandles.length).toBeGreaterThan(0);
    });
  });

  describe('Combined Filtering and Sorting', () => {
    it('applies both filter and sort together', async () => {
      const user = userEvent.setup();
      render(<SpeedRecords data={mockData} />);

      // Filter by 'Sector'
      const sensorFilter = screen.getByPlaceholderText('Rechercher...');
      await user.type(sensorFilter, 'Sector');

      // Sort by speed
      const speedHeader = screen.getByRole('button', { name: /Vitesse/i });
      await user.click(speedHeader);

      // Should show 2 filtered records, sorted by speed
      expect(screen.getByText('2 enregistrements trouvés')).toBeInTheDocument();

      const rows = screen.getAllByRole('row');
      // Lower speed should be first (180.3)
      expect(within(rows[2]).getByText('180.3 km/h')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays speed values correctly formatted', () => {
      render(<SpeedRecords data={mockData} />);

      expect(screen.getByText('250.5 km/h')).toBeInTheDocument();
      expect(screen.getByText('180.3 km/h')).toBeInTheDocument();
    });

    it('displays lane badges correctly', () => {
      render(<SpeedRecords data={mockData} />);

      const badges = screen.getAllByText('Gauche');
      expect(badges.length).toBe(2); // 2 Left lane records

      const rightBadges = screen.getAllByText('Droite');
      expect(rightBadges.length).toBe(2); // 2 Right lane records
    });

    it('displays dates in correct format', () => {
      render(<SpeedRecords data={mockData} />);

      // Check for date format dd/MM/yyyy HH:mm:ss
      const dates = screen.getAllByText(/05\/12\/2025/);
      expect(dates.length).toBeGreaterThan(0);
    });

    it('displays sensor names correctly', () => {
      render(<SpeedRecords data={mockData} />);

      expect(screen.getByText('Sector 1 Entry')).toBeInTheDocument();
      expect(screen.getByText('Sector 2 Entry')).toBeInTheDocument();
      expect(screen.getByText('Finish Line')).toBeInTheDocument();
      expect(screen.getByText('Pit Entry')).toBeInTheDocument();
    });

    it('handles null sensor names gracefully', () => {
      const dataWithNull: SpeedData[] = [
        {
          id: 1,
          sensor_name: null,
          speed: 250.5,
          lane: Lane.Left,
          created_at: '2025-12-05T10:00:00Z',
        },
      ];

      render(<SpeedRecords data={dataWithNull} />);
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });
});
