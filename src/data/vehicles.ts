export interface MakeData {
  make: string;
  models: string[];
}

export const POPULAR_MAKES: MakeData[] = [
  {
    make: 'BYD',
    models: ['Dolphin Mini', 'Dolphin', 'Atto 3', 'Seal', 'Han', 'Tang', 'Song Plus', 'Yuan Plus', 'Other model'],
  },
  {
    make: 'Audi',
    models: ['A1', 'A3', 'A4', 'A5', 'A6', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'e-tron GT', 'Other model'],
  },
  {
    make: 'BMW',
    models: ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', 'X1', 'X3', 'X5', 'X7', 'i4', 'iX', 'iX3', 'Other model'],
  },
  {
    make: 'Ford',
    models: ['Fiesta', 'Focus', 'Puma', 'Kuga', 'Ranger', 'Mustang Mach-E', 'Mondeo', 'Transit Custom', 'Other model'],
  },
  {
    make: 'Mercedes-Benz',
    models: ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'EQA', 'EQB', 'EQE', 'EQS', 'Other model'],
  },
  {
    make: 'Tesla',
    models: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Other model'],
  },
  {
    make: 'Volkswagen',
    models: ['Golf', 'Polo', 'Tiguan', 'T-Roc', 'ID.3', 'ID.4', 'ID.5', 'Passat', 'Arteon', 'Touareg', 'Other model'],
  },
  {
    make: 'Toyota',
    models: ['Yaris', 'Yaris Cross', 'Corolla', 'RAV4', 'C-HR', 'bZ4X', 'Hilux', 'Aygo X', 'Prius', 'Other model'],
  },
  {
    make: 'Hyundai',
    models: ['Tucson', 'Kona', 'Ioniq 5', 'Ioniq 6', 'i10', 'i20', 'i30', 'Santa Fe', 'Other model'],
  },
  {
    make: 'Kia',
    models: ['Sportage', 'EV6', 'EV9', 'Niro', 'Ceed', 'Picanto', 'Sorento', 'XCeed', 'Other model'],
  },
  {
    make: 'Nissan',
    models: ['Qashqai', 'Juke', 'Leaf', 'Ariya', 'X-Trail', 'Micra', 'Navara', 'Other model'],
  },
  {
    make: 'Land Rover',
    models: ['Defender', 'Discovery Sport', 'Discovery', 'Range Rover Evoque', 'Range Rover Velar', 'Range Rover Sport', 'Range Rover', 'Other model'],
  },
  {
    make: 'Peugeot',
    models: ['208', '2008', '308', '3008', '408', '5008', 'e-208', 'e-2008', 'Other model'],
  },
  {
    make: 'Vauxhall',
    models: ['Corsa', 'Astra', 'Mokka', 'Grandland', 'Crossland', 'Corsa Electric', 'Other model'],
  },
  {
    make: 'Volvo',
    models: ['XC40', 'XC60', 'XC90', 'EX30', 'EX90', 'V60', 'V90', 'Other model'],
  },
  {
    make: 'Other make',
    models: ['Other model'],
  },
];

export const YEARS = [
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2019',
  '2018',
  '2017',
  '2016',
  '2015',
  '2014 & Older',
];
