
const PopupContent = (props) => {
  // Function to stop propagation for clicks inside the popup content
  const handleContentClick = (e) => {
    e.stopPropagation(); // Prevents clicks within the content from closing the popup
  };

  return (
    <div 
      className="popupBackground fixed top-0 left-0 z-[1700] w-full h-full bg-black bg-opacity-50 flex items-center justify-center" >
      
      {/* Content Area: Does not propagate clicks to the overlay */}
      <div className="bg-white rounded-lg shadow-xl w-[80%] max-w-[30rem]" >
        <div className="p-8 text-center">
          <h3 className="text-lg font-bold mb-4 text-center">{props?.title}</h3>
          <p>{props?.message}</p>
        </div>
      </div>
    </div>
  );
};

export default PopupContent;
