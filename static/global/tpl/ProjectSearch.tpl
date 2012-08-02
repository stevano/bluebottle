<div class="results">
	<h2>FOUND <%= meta.total_count %> 1%PROJECTS</h2>
	<div class="paginator">
		<% if (null !== meta.previous) { %>
			<a href="#<%= meta.previous %>" >&lArr; PREVIOUS PAGE</a> ||
		<% } %>
		<% if (null !== meta.next) { %>
			<a href="#<%= meta.next %>" >NEXT PAGE &rArr; </a> 
		<% } %>
	</div>
	<div class="results">
		<%= list %>	
	</div>
</div>
