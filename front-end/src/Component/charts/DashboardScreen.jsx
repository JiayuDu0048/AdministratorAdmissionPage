import AreaCards from "./areaCards/AreaCards";
import AreaCharts from "./areaCharts/AreaCharts";

const Dashboard = () => {
  return (
    <div className="content-area">
      <h2 style={{margin: '50px'}}> Statistics Dashboard </h2>
      <AreaCards />
      <AreaCharts />
    </div>
  );
};

export default Dashboard;
