import AreaCards from "./areaCards/AreaCards";
import AreaCharts from "./areaCharts/AreaCharts";

const Dashboard = () => {
  return (
    <div className="content-area">
      <AreaCards />
      <AreaCharts />
    </div>
  );
};

export default Dashboard;
