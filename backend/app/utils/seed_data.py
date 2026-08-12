import datetime

SEED_INCIDENT_A = {
    "incident_id": "INC-1042",
    "title": "API Latency Spike",
    "severity": "critical",
    "service": "payment-api",
    "timestamp": "2026-08-12T10:14:00Z",
    "status": "resolved",
    "symptoms": [
        "API latency: 4.8 seconds",
        "Error rate: 12%",
        "Database connections: 98%",
        "Recent deployment: v2.4.1"
    ],
    "metrics": {
        "latency_sec": 4.8,
        "error_rate_pct": 12.0,
        "db_conn_pct": 98.0,
        "cpu_pct": 45.0,
        "memory_pct": 62.0
    },
    "logs": [
        "2026-08-12 10:14:02 ERROR [payment-api] ConnectionTimeout: Timeout waiting for connection from pool",
        "2026-08-12 10:14:05 WARN [payment-api] Active Connections: 98/100 (Max reached)",
        "2026-08-12 10:14:10 ERROR [payment-api] HTTP 504 Gateway Timeout on /v1/charge",
        "2026-08-12 10:14:15 INFO [payment-api] Cache hit ratio: 94.2% (Healthy)"
    ],
    "recent_changes": [
        "Deployed payment-api v2.4.1 at 09:30 UTC",
        "Increased request batch size in checkout worker"
    ],
    "possible_causes": [
        "Cache hit ratio drop",
        "Database connection pool exhaustion",
        "Upstream API timeout"
    ],
    "timeline": [
        {
            "id": "t1",
            "timestamp": "2026-08-12T10:14:00Z",
            "event_type": "detection",
            "title": "Incident Detected",
            "description": "Alert triggered: P99 Latency > 4s, DB Connection > 95%",
            "metadata": {"severity": "critical"}
        },
        {
            "id": "t2",
            "timestamp": "2026-08-12T10:20:00Z",
            "event_type": "action",
            "title": "Attempted Action: Increase Cache",
            "description": "Scaled Redis cache memory from 2GB to 4GB.",
            "metadata": {"status": "FAILED"}
        },
        {
            "id": "t3",
            "timestamp": "2026-08-12T10:25:00Z",
            "event_type": "action",
            "title": "Attempted Action: Restart Service",
            "description": "Restarted payment-api pod deployment.",
            "metadata": {"status": "FAILED"}
        },
        {
            "id": "t4",
            "timestamp": "2026-08-12T10:35:00Z",
            "event_type": "action",
            "title": "Attempted Action: Inspect DB Connection Pool",
            "description": "Increased connection pool limit from 100 to 300.",
            "metadata": {"status": "SUCCESS"}
        },
        {
            "id": "t5",
            "timestamp": "2026-08-12T10:40:00Z",
            "event_type": "resolution",
            "title": "Incident Resolved & Experience Stored",
            "description": "Root cause confirmed: Database connection pool exhaustion. Lesson stored in Hindsight.",
            "metadata": {"hindsight_bank": "incidentmind_sre"}
        }
    ],
    "failed_attempts": [
        {
            "action_id": "increase_cache",
            "action_name": "Increase Redis Cache Size",
            "timestamp": "2026-08-12T10:20:00Z",
            "status": "FAILED",
            "result_message": "FAILED — Redis cache hit ratio was already 94.2%. Cache scaling produced zero improvement in API latency or DB connection pressure.",
            "details": {"attempted_by": "On-call Engineer"}
        },
        {
            "action_id": "restart_service",
            "action_name": "Restart API Service Containers",
            "timestamp": "2026-08-12T10:25:00Z",
            "status": "FAILED",
            "result_message": "FAILED — Temporary 45-second latency reduction during container startup, then immediately spiked back to 4.8s as DB connections re-exhausted.",
            "details": {"attempted_by": "On-call Engineer"}
        }
    ],
    "successful_actions": [
        {
            "action_id": "check_db_pool",
            "action_name": "Inspect & Scale DB Connection Pool",
            "timestamp": "2026-08-12T10:35:00Z",
            "status": "SUCCESS",
            "result_message": "SUCCESS — Connection utilization dropped from 98% to 28%. API response latency normalized to 110ms and error rate dropped to 0.0%.",
            "details": {"new_pool_size": 300}
        }
    ],
    "root_cause": "Database connection pool exhaustion caused by high concurrent request volume exceeding pool capacity limit of 100 connections.",
    "resolution": "Increased max database connection pool limit to 300 and updated connection timeout threshold.",
    "lesson_learned": "High API latency combined with high DB connection utilization (>95%) should trigger database connection pool investigation before cache scaling."
}

SEED_INCIDENT_B = {
    "incident_id": "INC-1087",
    "title": "API Latency Spike — Recurrence",
    "severity": "critical",
    "service": "payment-api",
    "timestamp": "2026-08-12T14:00:00Z",
    "status": "active",
    "symptoms": [
        "API latency: 5.1 seconds",
        "Error rate: 11%",
        "Database connections: 96%",
        "Recent deployment: v2.4.3"
    ],
    "metrics": {
        "latency_sec": 5.1,
        "error_rate_pct": 11.0,
        "db_conn_pct": 96.0,
        "cpu_pct": 42.0,
        "memory_pct": 58.0
    },
    "logs": [
        "2026-08-12 14:00:15 ERROR [payment-api] Connection pool exhausted: 96/100 active connections",
        "2026-08-12 14:00:20 WARN [payment-api] DB query queue length: 142 requests waiting in pool queue",
        "2026-08-12 14:00:25 ERROR [payment-api] HTTP 504 Gateway Timeout on /v1/charge",
        "2026-08-12 14:00:30 INFO [payment-api] Cache hit ratio: 93.8% (Healthy)"
    ],
    "recent_changes": [
        "Deployed payment-api v2.4.3 at 13:45 UTC",
        "Enabled new promotion banner campaign"
    ],
    "possible_causes": [
        "Database connection pool exhaustion",
        "Cache hit ratio drop",
        "High CPU utilization"
    ],
    "timeline": [
        {
            "id": "t_b1",
            "timestamp": "2026-08-12T14:00:00Z",
            "event_type": "detection",
            "title": "Incident Detected",
            "description": "Alert triggered: P99 Latency 5.1s, DB Connection 96%",
            "metadata": {"severity": "critical"}
        }
    ],
    "failed_attempts": [],
    "successful_actions": [],
    "root_cause": None,
    "resolution": None,
    "lesson_learned": None
}

SEED_INCIDENT_AUTH_HISTORICAL = {
    "incident_id": "INC-1011",
    "title": "JWT Auth Verification Failure — Postmortem",
    "severity": "critical",
    "service": "auth-gateway",
    "timestamp": "2026-07-28T09:15:00Z",
    "status": "resolved",
    "symptoms": [
        "HTTP 401 Authorization Spikes: 32%",
        "JWT signature verification failed",
        "Recent deployment: rotated secrets"
    ],
    "metrics": {
        "latency_sec": 1.2,
        "error_rate_pct": 32.0,
        "db_conn_pct": 22.0,
        "cpu_pct": 35.0,
        "memory_pct": 40.0
    },
    "logs": [
        "2026-07-28 09:15:00 ERROR [auth-gateway] Invalid RS256 signature for key ID k8s-sec-auth-v2",
        "2026-07-28 09:15:05 ERROR [auth-gateway] Secret key ID mismatch: Expected auth-key-2026-v2"
    ],
    "recent_changes": ["Rotated auth signing secrets in Kubernetes secret vault"],
    "possible_causes": ["JWT secret rotation mismatch", "Pod replica container crash"],
    "timeline": [],
    "failed_attempts": [
        {
            "action_id": "restart_service",
            "action_name": "Restart API Service Containers",
            "timestamp": "2026-07-28T09:20:00Z",
            "status": "FAILED",
            "result_message": "FAILED — Pod restart reloaded the stale public key secret. HTTP 401 errors persisted.",
            "details": {}
        }
    ],
    "successful_actions": [
        {
            "action_id": "check_jwt_keys",
            "action_name": "Inspect Auth JWT Keys & Secret Rotation",
            "timestamp": "2026-07-28T09:30:00Z",
            "status": "SUCCESS",
            "result_message": "SUCCESS — Synchronized RS256 public key secret across auth gateway pods.",
            "details": {}
        }
    ],
    "root_cause": "Kubernetes secret vault failed to distribute rotated RS256 public key to auth-gateway replicas.",
    "resolution": "Applied force sync on auth-vault secrets operator and restarted secret watcher daemon.",
    "lesson_learned": "HTTP 401 authorization spikes following secret deployment indicate key sync mismatch, not pod replica exhaustion."
}

SEED_INCIDENT_AUTH_ACTIVE = {
    "incident_id": "INC-1099",
    "title": "Authentication Authorization Spike & Session Drops",
    "severity": "critical",
    "service": "auth-gateway",
    "timestamp": "2026-08-12T14:30:00Z",
    "status": "active",
    "symptoms": [
        "HTTP 401 Authorization Spikes: 28%",
        "JWT signature verification failed",
        "Recent deployment: auth-v2.1"
    ],
    "metrics": {
        "latency_sec": 1.4,
        "error_rate_pct": 28.0,
        "db_conn_pct": 25.0,
        "cpu_pct": 39.0,
        "memory_pct": 42.0
    },
    "logs": [
        "2026-08-12 14:30:10 ERROR [auth-gateway] Invalid RS256 signature for key ID k8s-sec-auth-v2",
        "2026-08-12 14:30:15 WARN [auth-gateway] 4200 authorization failures in 5 minute window"
    ],
    "recent_changes": [
        "Deployed auth-gateway v2.1.0 at 14:15 UTC",
        "Rotated JWT signing secret"
    ],
    "possible_causes": [
        "JWT secret key sync mismatch",
        "Service container crash",
        "Database pool saturation"
    ],
    "timeline": [
        {
            "id": "t_auth1",
            "timestamp": "2026-08-12T14:30:00Z",
            "event_type": "detection",
            "title": "Incident Detected",
            "description": "Alert triggered: HTTP 401 Auth Error Rate > 25%",
            "metadata": {"severity": "critical"}
        }
    ],
    "failed_attempts": [],
    "successful_actions": [],
    "root_cause": None,
    "resolution": None,
    "lesson_learned": None
}

SYNTHETIC_INCIDENTS = [
    {
        "incident_id": "INC-2001",
        "title": "Database Connection Exhaustion — Order Service",
        "severity": "critical",
        "service": "order-service",
        "timestamp": "2026-08-11T18:22:00Z",
        "status": "resolved",
        "symptoms": [
            "Checkout failures: 18%",
            "DB connection utilization: 99%",
            "Query queue time: 8.4s"
        ],
        "metrics": {
            "latency_sec": 4.1,
            "error_rate_pct": 18.0,
            "db_conn_pct": 99.0,
            "cpu_pct": 52.0,
            "memory_pct": 64.0
        },
        "logs": [
            "2026-08-11 18:22:01 ERROR [order-service] Postgres pool full (100/100)",
            "2026-08-11 18:22:05 ERROR [order-service] Could not acquire connection in 5000ms"
        ],
        "recent_changes": ["Database index migration applied"],
        "possible_causes": ["Unindexed join query in order lookup", "DB connection leak"],
        "timeline": [],
        "failed_attempts": [
            {
                "action_id": "increase_cache",
                "action_name": "Increase Redis Cache Size",
                "timestamp": "2026-08-11T18:25:00Z",
                "status": "FAILED",
                "result_message": "FAILED — Cache scaling did not reduce DB connection pool acquisition timeouts.",
                "details": {}
            }
        ],
        "successful_actions": [
            {
                "action_id": "check_db_pool",
                "action_name": "Inspect & Increase DB Pool Size",
                "timestamp": "2026-08-11T18:35:00Z",
                "status": "SUCCESS",
                "result_message": "SUCCESS — Expanded DB connection pool from 100 to 250 connections.",
                "details": {}
            }
        ],
        "root_cause": "Unoptimized order lookup query causing lingering DB connections and pool starvation.",
        "resolution": "Optimized order table index and raised max connection pool size.",
        "lesson_learned": "When order lookup latency spikes alongside 99% DB pool usage, check DB pool limits and index slow queries before touch cache."
    }
]

def generate_seed_incidents():
    from app.models.incident import Incident
    all_raw = [
        SEED_INCIDENT_A,
        SEED_INCIDENT_B,
        SEED_INCIDENT_AUTH_HISTORICAL,
        SEED_INCIDENT_AUTH_ACTIVE
    ] + SYNTHETIC_INCIDENTS
    return [Incident(**item) for item in all_raw]
