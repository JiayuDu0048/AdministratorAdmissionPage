import AreaCard from "./AreaCard";
import "./AreaCards.scss";

const AreaCards = () => {
  return (
    <section className="content-area-cards">
      <AreaCard
        colors={["#e4e8ef", "#7F00FF"]}
        percentFillValue={66}
        cardInfo={{
          title: "Session 1",
          value: "20/30",
          text: "20 Students in Session 1.",
        }}
      />
      <AreaCard
        colors={["#e4e8ef", "#7F00FF"]}
        percentFillValue={50}
        cardInfo={{
          title: "Session 2",
          value: "15/30",
          text: "15 Students in Session 2",
        }}
      />
      <AreaCard
        colors={["#e4e8ef", "#7F00FF"]}
        percentFillValue={33}
        cardInfo={{
          title: "Session 3",
          value: "10/30",
          text: "10 Students in Session 3",
        }}
      />
    </section>
  );
};

export default AreaCards;
