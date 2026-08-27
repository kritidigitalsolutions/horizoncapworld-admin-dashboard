import API from "./api";

// router.get("/plans", protectAdmin, getAllPlans);
// router.get("/plans/:id", protectAdmin, getPlanById);
// router.post("/plans", protectAdmin, createPlan);
// router.put("/plans/:id", protectAdmin, updatePlan);
// router.delete("/plans/:id", protectAdmin, deletePlan);


//get all plans

export const getAllPlans = async() => {
    const response = await API.get("/admin/plans");
    return response.data;
}

// get plans by id 

export const getPlansById = async (id) => {
    const response = await API.get(`/admin/plans/${id}`);
    return response.data;
}


// create new plans 
export const createPlan = async (planData) => {
    const response = await API.post("/admin/plans", planData);
    return response.data;
}

// update plans

export const updatePlans = async (id, planData) => {
    const response = await API.put(`/admin/plans/${id}`, planData);
    return response.data;
}

// delete plans

export const deletePlan = async(id) => {
    const response = await API.delete(`/admin/plans/${id}`);
    return response.data;
}