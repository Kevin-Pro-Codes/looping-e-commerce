
export const fetchData = async (tab, userId) => {
  try {
    const res = await fetch(`http://localhost:8000/api/${tab}/${userId}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return {};
  }
};

export const saveData = async (tab, userId, data) => {
  try {
    const res = await fetch(`http://localhost:8000/api/${tab}/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error("Save error:", err);
    return { message: "Error saving data" };
  }
};
