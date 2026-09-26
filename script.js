// =====================================================
// FASTAPI SERVER
// =====================================================

const API_URL = "https://mental-health-score-k0lh.onrender.com";


// =====================================================
// ELEMENTS
// =====================================================

const form =
    document.getElementById("predictionForm");

const predictBtn =
    document.getElementById("predictBtn");

const resetBtn =
    document.getElementById("resetBtn");

const buttonText =
    document.getElementById("buttonText");

const loader =
    document.getElementById("loader");

const errorBox =
    document.getElementById("errorBox");

const emptyResult =
    document.getElementById("emptyResult");

const predictionResult =
    document.getElementById("predictionResult");

const resultError =
    document.getElementById("resultError");

const resultErrorText =
    document.getElementById("resultErrorText");

const scoreValue =
    document.getElementById("scoreValue");

const scoreTitle =
    document.getElementById("scoreTitle");

const scoreMessage =
    document.getElementById("scoreMessage");

const gaugeFill =
    document.getElementById("gaugeFill");

const anotherBtn =
    document.getElementById("anotherBtn");

const tryAgainBtn =
    document.getElementById("tryAgainBtn");


// =====================================================
// STRESS LEVEL BUTTONS
// =====================================================

const stressButtons =
    document.querySelectorAll(
        ".stress-options button"
    );


stressButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            stressButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            document.getElementById(
                "Stress_Level"
            ).value =
                button.dataset.stress;


            clearError();

        }
    );

});


// =====================================================
// ERROR
// =====================================================

function showError(message) {

    errorBox.textContent =
        message;

    errorBox.classList.add(
        "show"
    );

}


function clearError() {

    errorBox.textContent = "";

    errorBox.classList.remove(
        "show"
    );

}


// =====================================================
// GET NUMBER
// =====================================================

function number(id) {

    return Number(
        document.getElementById(id).value
    );

}


// =====================================================
// CREATE PAYLOAD
// =====================================================

function getFormData() {

    return {

        Age:
            number("Age"),

        Gender:
            document.getElementById(
                "Gender"
            ).value,

        Country:
            document.getElementById(
                "Country"
            ).value.trim(),

        Academic_Level:
            document.getElementById(
                "Academic_Level"
            ).value,

        Most_Used_Platform:
            document.getElementById(
                "Most_Used_Platform"
            ).value,

        Purpose_Of_Use:
            document.getElementById(
                "Purpose_Of_Use"
            ).value,

        Avg_Daily_Usage_Hours:
            number(
                "Avg_Daily_Usage_Hours"
            ),

        Daily_Unlocks:
            number(
                "Daily_Unlocks"
            ),

        Study_Hours:
            number(
                "Study_Hours"
            ),

        Physical_Activity_Hours:
            number(
                "Physical_Activity_Hours"
            ),

        Sleep_Hours_Per_Night:
            number(
                "Sleep_Hours_Per_Night"
            ),

        Stress_Level:
            document.getElementById(
                "Stress_Level"
            ).value

    };

}


// =====================================================
// VALIDATION
// =====================================================

function validateData(data) {

    if (!data.Gender)
        return "Please select your gender.";

    if (!data.Country)
        return "Please enter your country.";

    if (!data.Academic_Level)
        return "Please select your academic level.";

    if (!data.Most_Used_Platform)
        return "Please select your most-used platform.";

    if (!data.Purpose_Of_Use)
        return "Please select your primary purpose.";

    if (!data.Stress_Level)
        return "Please select your stress level.";


    if (
        !Number.isInteger(data.Age) ||
        data.Age < 10 ||
        data.Age > 100
    ) {

        return "Age must be between 10 and 100.";

    }


    if (
        data.Avg_Daily_Usage_Hours < 0 ||
        data.Avg_Daily_Usage_Hours > 24
    ) {

        return "Daily usage must be between 0 and 24 hours.";

    }


    if (
        !Number.isInteger(data.Daily_Unlocks) ||
        data.Daily_Unlocks < 0
    ) {

        return "Daily unlocks must be 0 or more.";

    }


    if (
        data.Study_Hours < 0 ||
        data.Study_Hours > 24
    ) {

        return "Study hours must be between 0 and 24.";

    }


    if (
        data.Physical_Activity_Hours < 0 ||
        data.Physical_Activity_Hours > 24
    ) {

        return "Physical activity must be between 0 and 24 hours.";

    }


    if (
        data.Sleep_Hours_Per_Night < 0 ||
        data.Sleep_Hours_Per_Night > 24
    ) {

        return "Sleep must be between 0 and 24 hours.";

    }


    return null;

}


// =====================================================
// LOADING
// =====================================================

function setLoading(loading) {

    predictBtn.disabled =
        loading;

    if (loading) {

        predictBtn.classList.add(
            "loading"
        );

        buttonText.style.display =
            "none";

        loader.style.display =
            "block";

    }

    else {

        predictBtn.classList.remove(
            "loading"
        );

        buttonText.style.display =
            "inline";

        loader.style.display =
            "none";

    }

}


// =====================================================
// SHOW RESULT
// =====================================================

function showPrediction(score) {

    const value =
        Number(score);


    if (!Number.isFinite(value)) {

        throw new Error(
            "Invalid prediction returned by API."
        );

    }


    // Hide empty screen

    emptyResult.style.display =
        "none";

    resultError.classList.remove(
        "show"
    );


    // Show result

    predictionResult.classList.add(
        "show"
    );


    // Display score

    scoreValue.textContent =
        value.toFixed(2);


    /*
        Your backend returns the model score.

        We do NOT change the score.

        Gauge is only a visual representation.
    */

    const gaugePercent =
        Math.max(
            0,
            Math.min(100, value * 10)
        );


    // Convert score to gauge rotation

    const rotation =
        -90 +
        (gaugePercent * 1.8);


    gaugeFill.style.borderTopColor =
        "#67c9a8";

    gaugeFill.style.transform =
        `rotate(${rotation}deg)`;


    // Message

    if (value < 35) {

        scoreTitle.textContent =
            "Signal detected";

        scoreMessage.textContent =
            "Your model output is in the lower part of the displayed score range.";

    }

    else if (value < 70) {

        scoreTitle.textContent =
            "Balanced signal";

        scoreMessage.textContent =
            "Your model output is in the middle part of the displayed score range.";

    }

    else {

        scoreTitle.textContent =
            "Strong signal";

        scoreMessage.textContent =
            "Your model output is in the higher part of the displayed score range.";

    }

}


// =====================================================
// SHOW RESULT ERROR
// =====================================================

function showResultError(message) {

    emptyResult.style.display =
        "none";

    predictionResult.classList.remove(
        "show"
    );

    resultError.classList.add(
        "show"
    );

    resultErrorText.textContent =
        message;

}


// =====================================================
// API REQUEST
// =====================================================

async function sendPrediction(data) {

    const response =
        await fetch(
            `${API_URL}/predict`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json"

                },

                body:
                    JSON.stringify(data)

            }
        );


    let result;


    try {

        result =
            await response.json();

    }

    catch {

        throw new Error(
            "Invalid response received from FastAPI."
        );

    }


    // FastAPI validation error

    if (!response.ok) {

        if (
            Array.isArray(
                result.detail
            )
        ) {

            const errors =
                result.detail
                    .map(error => {

                        const field =
                            error.loc?.at(-1)
                            || "Field";

                        return (
                            field +
                            ": " +
                            error.msg
                        );

                    })
                    .join(" | ");


            throw new Error(
                errors
            );

        }


        throw new Error(
            result.detail ||
            `API error ${response.status}`
        );

    }


    /*
        IMPORTANT

        Your backend response model is:

        predicated_mental_health_score

        So we use that exact property.
    */

    return result
        .predicated_mental_health_score;

}


// =====================================================
// SUBMIT
// =====================================================

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        clearError();


        // Browser validation

        if (
            !form.checkValidity()
        ) {

            form.reportValidity();

            showError(
                "Please complete all required fields."
            );

            return;

        }


        const data =
            getFormData();


        const validationError =
            validateData(data);


        if (validationError) {

            showError(
                validationError
            );

            return;

        }


        setLoading(true);


        try {

            const score =
                await sendPrediction(
                    data
                );


            showPrediction(
                score
            );

        }


        catch (error) {

            console.error(
                error
            );


            const message =
                error instanceof TypeError
                    ? "Cannot connect to FastAPI. Make sure Uvicorn is running on port 2200."
                    : error.message;


            showResultError(
                message
            );

        }


        finally {

            setLoading(false);

        }

    }
);


// =====================================================
// RESET
// =====================================================

function resetUI() {

    clearError();


    predictionResult.classList.remove(
        "show"
    );


    resultError.classList.remove(
        "show"
    );


    emptyResult.style.display =
        "flex";


    scoreValue.textContent =
        "0.00";


    gaugeFill.style.transform =
        "rotate(-90deg)";


    stressButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );


    document.getElementById(
        "Stress_Level"
    ).value = "";

}


resetBtn.addEventListener(
    "click",
    resetUI
);


// =====================================================
// RUN ANOTHER READ
// =====================================================

anotherBtn.addEventListener(
    "click",
    () => {

        predictionResult.classList.remove(
            "show"
        );

        resultError.classList.remove(
            "show"
        );

        emptyResult.style.display =
            "flex";

        scoreValue.textContent =
            "0.00";

        gaugeFill.style.transform =
            "rotate(-90deg)";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


// =====================================================
// TRY AGAIN
// =====================================================

tryAgainBtn.addEventListener(
    "click",
    () => {

        resultError.classList.remove(
            "show"
        );

        emptyResult.style.display =
            "flex";

    }
);


// =====================================================
// CLEAR ERROR WHEN USER CHANGES INPUT
// =====================================================

document
    .querySelectorAll(
        "input, select"
    )
    .forEach(element => {

        element.addEventListener(
            "input",
            clearError
        );

        element.addEventListener(
            "change",
            clearError
        );

    });