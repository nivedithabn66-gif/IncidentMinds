import pytest
from app.models.incident import Incident
from app.models.memory import IncidentMemoryExperience
from app.services.memory_service import MemoryService
from app.services.agent_service import SREAgentService
from app.services.incident_service import IncidentService
from app.services.incident_reasoning_service import IncidentReasoningService

@pytest.fixture
def memory_svc():
    return MemoryService()

@pytest.fixture
def agent_svc():
    return SREAgentService()

@pytest.fixture
def incident_svc():
    return IncidentService()

@pytest.fixture
def reasoning_svc():
    return IncidentReasoningService()

def test_store_incident_memory(memory_svc):
    exp = IncidentMemoryExperience(
        incident_id="TEST-101",
        service="checkout-service",
        symptoms=["API Latency 4.5s", "DB Connections 95%"],
        root_cause="Database pool limit exhausted",
        resolution="Increased pool limit to 300",
        lesson="Check database connections first"
    )
    result = memory_svc.store_incident_experience(exp)
    assert result is True
    assert memory_svc.get_incident_memory("TEST-101") is not None

def test_store_failed_attempt(memory_svc):
    result = memory_svc.store_failed_attempt(
        incident_id="TEST-101",
        action_name="Increase Redis Cache Size",
        result_message="Latency unchanged",
        symptoms=["API Latency 4.5s"],
        service="checkout-service"
    )
    assert result is True
    exp = memory_svc.get_incident_memory("TEST-101")
    assert exp.success_or_failure == "FAILED"

def test_store_successful_resolution(memory_svc):
    result = memory_svc.store_successful_resolution(
        incident_id="TEST-101",
        action_name="Inspect DB Connection Pool",
        root_cause="Database connection pool exhaustion",
        resolution="Expanded pool limit from 100 to 300",
        lesson_learned="High DB utilization should trigger connection pool inspection before cache scaling."
    )
    assert result is True
    exp = memory_svc.get_incident_memory("TEST-101")
    assert exp.success_or_failure == "SUCCESS"

def test_recall_similar_incidents(memory_svc):
    exp = IncidentMemoryExperience(
        incident_id="INC-1042",
        service="checkout-service",
        symptoms=["API Latency 5.1s", "DB Connections 96%"],
        root_cause="Database connection pool exhaustion",
        resolution="Expanded pool limit from 100 to 300",
        lesson="Check database connections first"
    )
    memory_svc.store_incident_experience(exp)

    response = memory_svc.recall_similar_incidents(
        query_text="API latency spike with high DB pool utilization",
        symptoms=["API Latency 5.1s", "DB Connections 96%"],
        service="checkout-service",
        memory_enabled=True
    )
    assert response.memory_enabled is True
    assert response.recalled_count > 0
    assert response.top_match is not None
    assert response.top_match.similarity_score > 0.70

# Section 18: Test A — No Historical Memory Baseline
def test_pipeline_test_a_no_memory(reasoning_svc):
    inc = Incident(
        incident_id="INC-TEST-A",
        title="Active Latency Spike",
        severity="critical",
        service="checkout-service",
        timestamp="2026-08-12T10:00:00Z",
        status="active",
        symptoms=["API Latency 5.1s", "DB connections 96%"],
        metrics={"latency_sec": 5.1, "db_conn_pct": 96},
        logs=[], recent_changes=[], possible_causes=[], timeline=[], failed_attempts=[], successful_actions=[]
    )
    res = reasoning_svc.analyze_incident(inc, memory_enabled=False)
    assert res["memory_enabled"] is False
    assert res["recommended_action"] == "Increase Redis Cache Size"
    assert res["memory_influence_score"] == "NONE"

# Section 18: Test B — Failed Approach Penalized
def test_pipeline_test_b_failed_approach_penalized(reasoning_svc):
    inc = Incident(
        incident_id="INC-TEST-B",
        title="Active Latency Spike",
        severity="critical",
        service="checkout-service",
        timestamp="2026-08-12T10:00:00Z",
        status="active",
        symptoms=["API Latency 5.1s", "DB connections 96%"],
        metrics={"latency_sec": 5.1, "db_conn_pct": 96},
        logs=[], recent_changes=[], possible_causes=[], timeline=[], failed_attempts=[], successful_actions=[]
    )
    res = reasoning_svc.analyze_incident(inc, memory_enabled=True)
    assert "Increase Redis Cache Size" in res["previous_failures"]
    assert res["recommended_action"] != "Increase Redis Cache Size"

# Section 18: Test C — Successful Approach Boosted when Context Matches
def test_pipeline_test_c_successful_approach_boosted(reasoning_svc):
    inc = Incident(
        incident_id="INC-TEST-C",
        title="Active Latency Spike",
        severity="critical",
        service="checkout-service",
        timestamp="2026-08-12T10:00:00Z",
        status="active",
        symptoms=["API Latency 5.1s", "DB connections 96%"],
        metrics={"latency_sec": 5.1, "db_conn_pct": 96},
        logs=[], recent_changes=[], possible_causes=[], timeline=[], failed_attempts=[], successful_actions=[]
    )
    res = reasoning_svc.analyze_incident(inc, memory_enabled=True)
    assert res["recommended_action"] == "Inspect Database Connection Pool"
    assert res["memory_influence_score"] == "HIGH"

# Section 18: Test D — Conflicting Historical Experiences
def test_pipeline_test_d_conflicting_memories(reasoning_svc, memory_svc):
    # Store conflicting memories
    m1 = IncidentMemoryExperience(
        incident_id="MEM-CONFLICT-1",
        service="payment-service",
        symptoms=["Latency 3s"],
        investigation_action="Inspect DB Connection Pool",
        success_or_failure="SUCCESS"
    )
    m2 = IncidentMemoryExperience(
        incident_id="MEM-CONFLICT-2",
        service="payment-service",
        symptoms=["Latency 3s"],
        investigation_action="Rollback Recent Deployment",
        success_or_failure="SUCCESS"
    )
    memory_svc.store_incident_experience(m1)
    memory_svc.store_incident_experience(m2)

    inc = Incident(
        incident_id="INC-TEST-D",
        title="Conflicting Symptoms",
        severity="warning",
        service="payment-service",
        timestamp="2026-08-12T10:00:00Z",
        status="active",
        symptoms=["Latency 3s"],
        metrics={"latency_sec": 3.0, "db_conn_pct": 55},
        logs=[], recent_changes=[], possible_causes=[], timeline=[], failed_attempts=[], successful_actions=[]
    )
    res = reasoning_svc.analyze_incident(inc, memory_enabled=True)
    assert res["agent_status"] == "INVESTIGATED"

# Section 18: Test E — New Resolution & Lesson Storage Loop
def test_pipeline_test_e_new_lesson_storage(incident_svc, reasoning_svc, memory_svc):
    incident_svc.reset_demo()
    inc1087 = incident_svc.get_incident("INC-1087")
    
    lesson = reasoning_svc.generate_and_store_lesson(
        incident=inc1087,
        root_cause="Connection pool limits",
        resolution="Scaled pool to 300",
        lesson_learned="Check DB pool early during latency spikes"
    )
    assert lesson["incident_id"] == "INC-1087"
    assert len(reasoning_svc.get_learning_history()) > 0

# Section 15: Second Learning Scenario — Auth JWT Key Rotation Failure
def test_scenario_2_auth_jwt_learning_loop(incident_svc, agent_svc):
    incident_svc.reset_demo()
    auth_inc = incident_svc.get_incident("INC-1099")
    assert auth_inc is not None

    res = agent_svc.investigate_incident(auth_inc, memory_enabled=True)
    assert res["memory_enabled"] is True
    # Verify agent retrieves INC-1011 experience and prioritizes JWT Key inspection over restarting service
    assert res["recommended_action"] == "Inspect Auth JWT Keys & Secret Rotation"
    assert "Restart API Service Containers" in res["previous_failures"]
