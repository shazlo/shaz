"""Business meters live here, e.g. feed.refill.duration, feed.queue.empty,
swipes.stream.lag, orders.hold.expired, auth.refresh.reuse_detected."""

from opentelemetry import metrics

meter = metrics.get_meter("shazlo")
