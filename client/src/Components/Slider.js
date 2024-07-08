import React from 'react';
import Slider from 'react-slider';
import 'tailwindcss/tailwind.css';

const GreenSlider = ({ value, onChange }) => {
  return (
    <Slider
      value={value}
      onChange={onChange}
      className="w-full h-2 mt-6 bg-green-200 rounded-lg"
      thumbClassName="w-4 h-4 bg-green-500 rounded-full shadow"
      trackClassName="bg-green-500"
      renderThumb={(props, state) => <div {...props} />}
    />
  );
};

export default GreenSlider;
