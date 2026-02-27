output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.redwall.id
}

output "public_ip" {
  description = "Public IP address of the Redwall game server"
  value       = aws_instance.redwall.public_ip
}

output "game_url" {
  description = "URL to play the Redwall game"
  value       = "http://${aws_instance.redwall.public_ip}"
}
