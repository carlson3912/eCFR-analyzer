import React from 'react';
import AgencyTable from '../components/AgencyTable';
import TitleSizePieChart from '../components/PieChart';

export default function HomePage() {
  return (
    <>
      <TitleSizePieChart />
      <AgencyTable />
    </>
  );
}
