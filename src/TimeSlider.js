import React, { useState } from 'react';
import moment from 'moment-timezone';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import InputSlider from 'react-input-slider';
import { FiMove } from 'react-icons/fi'; // Importing icon for drag and drop
import './TimeSlider.css'; // Import TimeSlider.css for styling

const TimeSlider = () => {
  const initialTimeZones = [
    { name: 'UTC', zone: 'UTC', sliderValue: 0 },
    { name: 'Indian Standard Time', zone: 'Asia/Kolkata', sliderValue: 0 }
  ];

  const [timeZones, setTimeZones] = useState(initialTimeZones);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isReversed, setIsReversed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTimeZone, setSelectedTimeZone] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleSliderChange = (value, index) => {
    const updatedTimeZones = [...timeZones];
    updatedTimeZones[index].sliderValue = value;
    setTimeZones(updatedTimeZones);

    const selectedTimeUTC = moment().utc().hour(value);

    const newConvertedTimes = updatedTimeZones.map(zone => {
      if (zone.zone === 'Asia/Kolkata') {
        return selectedTimeUTC.clone().add(5, 'hours').add(30, 'minutes').hour();
      } else {
        return selectedTimeUTC.clone().tz(zone.zone).hour();
      }
    });
    setTimeZones(updatedTimeZones.map((zone, idx) => ({ ...zone, sliderValue: newConvertedTimes[idx] })));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleReverseOrder = () => {
    setTimeZones([...timeZones].reverse());
    setIsReversed(!isReversed);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleAddTimeZone = () => {
    if (selectedTimeZone) {
      const newTimeZone = { name: selectedTimeZone, zone: selectedTimeZone, sliderValue: 0 };
      setTimeZones([...timeZones, newTimeZone]);
    }
  };

  const handleRemoveTimeZone = (indexToRemove) => {
    const updatedTimeZones = timeZones.filter((zone, index) => index !== indexToRemove);
    setTimeZones(updatedTimeZones);
  };

  const handleScheduleMeet = () => {
    const selectedDateTime = moment(selectedDate).utc().format('YYYYMMDD[T]HHmmss[Z]');
    const meetingUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?vcon=meet&dates=${selectedDateTime}/${selectedDateTime}&hl=en&pli=1`;
    window.open(meetingUrl, '_blank');
  };

  const generatePublicLink = () => {
    const selectedTimeUTC = moment(selectedDate).utc();
    const link = `${window.location.origin}/meeting?date=${selectedTimeUTC.toISOString()}&timezones=${timeZones.map(zone => zone.zone).join(',')}`;
    alert(`Shareable public link: ${link}`);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (index) => {
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }
    const updatedTimeZones = [...timeZones];
    const draggedItem = updatedTimeZones[draggedIndex];
    updatedTimeZones.splice(draggedIndex, 1);
    updatedTimeZones.splice(index, 0, draggedItem);
    setTimeZones(updatedTimeZones);
    setDraggedIndex(index);
  };

  return (
    <div className={`time-slider ${isDarkMode ? 'dark-mode' : ''}`}>
      <h2>Convert Time between Time Zones</h2>
      <div className="controls">
        <button onClick={generatePublicLink}>Get Shareable Public Link</button>
        <button onClick={handleScheduleMeet}>Schedule Meet</button>
        <DatePicker selected={selectedDate} onChange={handleDateChange} />
        <button onClick={handleReverseOrder}>Reverse Order</button>
        <button onClick={handleToggleDarkMode}>Toggle Dark Mode</button>
        <select value={selectedTimeZone} onChange={(e) => setSelectedTimeZone(e.target.value)}>
          <option value="">Select Time Zone</option>
          <option value="Eastern Time">Eastern Time</option>
          <option value="Pacific Standard Time">Pacific Standard Time</option>
          {/* Add more time zones as needed */}
        </select>
        <button onClick={handleAddTimeZone}>Add Time Zone</button>
      </div>
      <div className="time-zone-list">
        {timeZones.map((zone, index) => (
          <div
            key={zone.zone}
            className={`time-zone ${draggedIndex === index ? 'dragged' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
            onDragOver={() => handleDragOver(index)}
          >
            <div className="drag-icon">
              <FiMove />
            </div>
            <h3>{zone.name}</h3>
            <InputSlider
              axis="x"
              x={zone.sliderValue}
              onChange={({ x }) => handleSliderChange(x, index)}
              xstep={1}
              xmin={0}
              xmax={23}
            />
            <span>{moment().utc().hour(zone.sliderValue).format('HH:mm')} UTC</span>
            <p className={isDarkMode ? 'light-text' : ''}>{moment().utc().hour(zone.sliderValue).tz(zone.zone).format('HH:mm')} {zone.name}</p>
            {timeZones.length > 2 && (
              <button onClick={() => handleRemoveTimeZone(index)}>Remove</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeSlider;
