import React from 'react';
import { AverageSpeedChart } from './AverageSpeedChart';
import { VehicleCountChart } from './VehicleCountChart';
import { VehicleTypeChart } from './VehicleTypeChart';
import { SpeedDistributionChart } from './SpeedDistributionChart';
import { AccelerationChart } from './AccelerationChart';

export const AnalyticsGrid: React.FC = () => {
  return (
    <div className="space-y-3.5">
      {/* 4 Mid-Level Analytics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AverageSpeedChart />
        <VehicleCountChart />
        <VehicleTypeChart />
        <SpeedDistributionChart />
      </section>

      {/* Full-Width Acceleration / Braking Activity Card */}
      <section>
        <AccelerationChart />
      </section>
    </div>
  );
};

export default AnalyticsGrid;
